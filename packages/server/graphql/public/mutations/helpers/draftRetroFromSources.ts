import type {GraphQLResolveInfo} from 'graphql'
import {GraphQLError} from 'graphql'
import {markdownToTipTap} from '../../../../../client/shared/tiptap/markdownToTipTap'
import {replaceCalloutsWithBlockquotes} from '../../../../../client/shared/tiptap/replaceCalloutsWithBlockquotes'
import tagIssueLinks from '../../../../../client/shared/tiptap/tagIssueLinks'
import {
  compareNewestFirst,
  type InspirationIssue,
  rankInspirationIssue
} from '../../../../integrations/platform/InspirationIssue'
import getKysely from '../../../../postgres/getKysely'
import loadTeamBriefing from '../../../../utils/loadTeamBriefing'
import OpenAIServerManager from '../../../../utils/OpenAIServerManager'
import type {GQLContext} from '../../../graphql'
import type {InspirationSourceInput, ServiceEnum} from '../../resolverTypes'
import type {InspirationItemSource} from '../../types/InspirationItem'
import {
  formatNumberedIssues,
  INSPIRATION_DRAFT_SERVICE,
  numberIssues
} from './gatherInspirationIssues'
import gatherRangeIssues from './gatherRangeIssues'
import {formatIssueLinesForAI} from './issuesForAI'
import toInspirationIssue from './toInspirationIssue'

// The AI reads a range's newest issues, one line each. A range with more than this calls for more frequent
// retros, not a longer read
const MAX_READ_ISSUES = 300
// and an excerpt of what the most notable few say
const MAX_DETAILED_ISSUES = 20
const MAX_DRAFTS = 6

const MARKDOWN_LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g
// An issue's number or key, like #14286 or PAR-812: at the end of its reference, or leading a link's text
const ISSUE_REF = /(#\d+|\b[A-Z][A-Z0-9]*-\d+)$/
const LEADING_ISSUE_REF = /^(#\d+|[A-Z][A-Z0-9]*-\d+)(?=\s|$)/

interface SourcedIssue {
  service: ServiceEnum
  issue: InspirationIssue
}

// Each kind of issue from each source takes a turn putting forward its most notable one, so a kind
// that reports fewer signals, like a standup answer next to a busy pull request, still gets an excerpt
const takeTurns = <T extends SourcedIssue>(issues: readonly T[], limit: number) => {
  const toQueueKey = ({service, issue}: T) => `${service}:${issue.kind}`
  const queues = [...new Set(issues.map(toQueueKey))].map((queueKey) =>
    issues
      .filter((sourcedIssue) => toQueueKey(sourcedIssue) === queueKey)
      .sort((a, b) => rankInspirationIssue(b.issue) - rankInspirationIssue(a.issue))
  )
  const taken: T[] = []
  for (let turn = 0; taken.length < limit; turn++) {
    const turnIssues = queues.flatMap((queue) => queue[turn] ?? [])
    if (turnIssues.length === 0) break
    taken.push(...turnIssues.slice(0, limit - taken.length))
  }
  return taken
}

interface Options {
  meetingId: string
  teamId: string
  viewerId: string
  viewerName: string
  prompts: {id: string; question: string; description: string}[]
  sources: readonly InspirationSourceInput[]
  userPrompt: string | null | undefined
  context: GQLContext
  info: GraphQLResolveInfo
}

// A retro draft is about one issue or a theme across many, so it carries the issues it was drawn from. The AI reads
// the whole date range at once and drafts only the few things worth raising, and a draft whose column it isn't sure
// of is dropped, not left for the viewer to sort. An issue backs one draft at most.
const draftRetroFromSources = async (options: Options) => {
  const {meetingId, teamId, viewerId, viewerName, prompts, sources, userPrompt, context, info} =
    options
  const [rangeSources, teamBriefing] = await Promise.all([
    gatherRangeIssues(sources, teamId, viewerId, context, info),
    loadTeamBriefing(teamId, context.dataLoader)
  ])
  const rangeIssues = rangeSources.flatMap(({service, sourceIssues}) =>
    sourceIssues.map((issue) => ({service, issue}))
  )
  if (rangeIssues.length === 0) return {inspirationItems: [], issues: [], issueCount: 0}

  // Listed by source, newest first, so a run of related work reads in order
  const serviceOrder = sources.map(({service}) => service)
  const numberedIssues = numberIssues(
    rangeIssues
      .sort((a, b) => compareNewestFirst(a.issue, b.issue))
      .slice(0, MAX_READ_ISSUES)
      .sort(
        (a, b) =>
          serviceOrder.indexOf(a.service) - serviceOrder.indexOf(b.service) ||
          compareNewestFirst(a.issue, b.issue)
      )
  )
  const detailedIds = new Set(takeTurns(numberedIssues, MAX_DETAILED_ISSUES).map(({id}) => id))
  const issuesText = formatNumberedIssues(numberedIssues, (issues, ids) =>
    formatIssueLinesForAI(issues, ids, detailedIds)
  )

  const manager = new OpenAIServerManager()
  const result = await manager.generateRetroDrafts(
    issuesText,
    prompts.map(({question, description}) => ({question, description})),
    viewerName,
    MAX_DRAFTS,
    userPrompt,
    teamBriefing
  )
  if (!result) {
    throw new GraphQLError('Unable to draft reflections right now. Please try again.', {
      extensions: {code: 'SERVICE_UNAVAILABLE'}
    })
  }
  await getKysely()
    .insertInto('AIRequest')
    .values({userId: viewerId, tokenCost: result.tokenCost})
    .execute()

  const issueById = new Map(
    numberedIssues.map((numberedIssue) => [numberedIssue.id, numberedIssue])
  )
  const idByUrl = new Map(
    numberedIssues.flatMap(({id, issue}) => (issue.url ? [[issue.url, id] as const] : []))
  )
  const serviceByUrl = new Map(
    numberedIssues.flatMap(({service, issue}) => (issue.url ? [[issue.url, service] as const] : []))
  )
  const refByUrl = new Map(
    numberedIssues.flatMap(({issue}) => {
      const ref = ISSUE_REF.exec(issue.reference)?.[1]
      return issue.url && ref ? [[issue.url, ref] as const] : []
    })
  )
  // The AI sometimes names a linked issue by another one's number, so a link's text takes the number of the issue
  // it links to
  const relabelLinks = (markdown: string) =>
    markdown.replace(MARKDOWN_LINK, (link, label: string, url: string) => {
      const ref = refByUrl.get(url)
      return ref && LEADING_ISSUE_REF.test(label)
        ? `[${label.replace(LEADING_ISSUE_REF, ref)}](${url})`
        : link
    })
  const createdAt = new Date()
  const claimedIds = new Set<string>()
  const inspirationItems: InspirationItemSource[] = []
  result.items.forEach(({issueIds, promptIndex, isColumnClear, content}) => {
    const prompt = prompts[promptIndex]
    if (inspirationItems.length >= MAX_DRAFTS || !isColumnClear || !prompt) return
    const linkedIds = [...content.matchAll(MARKDOWN_LINK)].flatMap(
      (match) => idByUrl.get(match[2] ?? '') ?? []
    )
    const sourceIssues = [...new Set([...issueIds, ...linkedIds])].flatMap((id) => {
      const numberedIssue = issueById.get(id)
      return numberedIssue && !claimedIds.has(id) ? [numberedIssue] : []
    })
    if (sourceIssues.length === 0) return
    sourceIssues.forEach(({id}) => claimedIds.add(id))
    inspirationItems.push({
      id: `${INSPIRATION_DRAFT_SERVICE}:${meetingId}:${createdAt.getTime()}:${inspirationItems.length}`,
      service: INSPIRATION_DRAFT_SERVICE,
      title: null,
      promptId: prompt.id,
      content: tagIssueLinks(
        {
          type: 'doc',
          content: replaceCalloutsWithBlockquotes(markdownToTipTap(relabelLinks(content)))
        },
        serviceByUrl
      ),
      createdAt,
      issues: sourceIssues
        .sort((a, b) => compareNewestFirst(a.issue, b.issue))
        .map((numberedIssue) => toInspirationIssue(numberedIssue))
    })
  })
  return {
    inspirationItems,
    issues: numberedIssues.map((numberedIssue) => toInspirationIssue(numberedIssue)),
    issueCount: rangeIssues.length
  }
}

export default draftRetroFromSources
