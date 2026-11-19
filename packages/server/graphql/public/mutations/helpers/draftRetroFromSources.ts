import type {GraphQLResolveInfo} from 'graphql'
import {GraphQLError} from 'graphql'
import {markdownToTipTap} from '../../../../../client/shared/tiptap/markdownToTipTap'
import {replaceCalloutsWithBlockquotes} from '../../../../../client/shared/tiptap/replaceCalloutsWithBlockquotes'
import tagIssueLinks from '../../../../../client/shared/tiptap/tagIssueLinks'
import {rankInspirationIssue} from '../../../../integrations/platform/InspirationIssue'
import getKysely from '../../../../postgres/getKysely'
import OpenAIServerManager from '../../../../utils/OpenAIServerManager'
import type {GQLContext} from '../../../graphql'
import type {InspirationSourceInput} from '../../resolverTypes'
import type {InspirationItemSource} from '../../types/GenerateInspirationItemsPayload'
import gatherInspirationIssues, {
  formatNumberedIssues,
  INSPIRATION_DRAFT_SERVICE,
  type NumberedIssue
} from './gatherInspirationIssues'
import toInspirationIssue from './toInspirationIssue'

// The AI reads only a page's most notable issues, so a page of many keeps its cost and wait down
const MAX_CANDIDATES = 15

// Each kind of issue from each source takes a turn putting forward its most notable one, so a kind
// that reports fewer signals, like a standup answer next to a busy pull request, still gets read
const pickCandidates = (numberedIssues: readonly NumberedIssue[]) => {
  const toQueueKey = ({service, issue}: NumberedIssue) => `${service}:${issue.kind}`
  const queues = [...new Set(numberedIssues.map(toQueueKey))].map((queueKey) =>
    numberedIssues
      .filter((numberedIssue) => toQueueKey(numberedIssue) === queueKey)
      .sort((a, b) => rankInspirationIssue(b.issue) - rankInspirationIssue(a.issue))
  )
  const candidates: NumberedIssue[] = []
  for (let turn = 0; candidates.length < MAX_CANDIDATES; turn++) {
    const turnIssues = queues.flatMap((queue) => queue[turn] ?? [])
    if (turnIssues.length === 0) break
    candidates.push(...turnIssues.slice(0, MAX_CANDIDATES - candidates.length))
  }
  return candidates
}

interface Options {
  meetingId: string
  teamId: string
  viewerId: string
  viewerName: string
  prompts: {id: string; question: string; description: string}[]
  sources: readonly InspirationSourceInput[]
  userPrompt: string | null | undefined
  canDraft: boolean
  before: Date | null
  context: GQLContext
  info: GraphQLResolveInfo
}

// A retro draft is about one issue, so it travels with that issue. The AI only drafts the few
// items worth raising, and a draft whose column it isn't sure of is dropped, not left for the
// viewer to sort. Each call drafts one page of the timeline: the stretch of work just older than `before`,
// which the viewer already sees listed, so the drafts can arrive after the list.
const draftRetroFromSources = async (options: Options) => {
  const {
    meetingId,
    teamId,
    viewerId,
    viewerName,
    prompts,
    sources,
    userPrompt,
    canDraft,
    before,
    context,
    info
  } = options
  const {numberedIssues, nextBefore} = await gatherInspirationIssues(
    sources,
    teamId,
    viewerId,
    context,
    info,
    {before}
  )

  if (numberedIssues.length === 0 || !canDraft) {
    return {
      inspirationItems: [],
      issues: numberedIssues.map((numberedIssue) => toInspirationIssue(numberedIssue, null)),
      nextBefore
    }
  }

  const candidates = pickCandidates(numberedIssues)
  const manager = new OpenAIServerManager()
  const result = await manager.generateRetroDrafts(
    formatNumberedIssues(candidates),
    prompts.map(({question, description}) => ({question, description})),
    viewerName,
    userPrompt
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

  const issueIds = new Set(candidates.map(({id}) => id))
  const serviceByUrl = new Map(
    numberedIssues.flatMap(({service, issue}) => (issue.url ? [[issue.url, service] as const] : []))
  )
  const createdAt = new Date()
  const draftByIssueId = new Map<string, InspirationItemSource>()
  result.items.forEach(({issueId, promptIndex, isColumnClear, content}) => {
    const prompt = prompts[promptIndex]
    if (!isColumnClear || !prompt || !issueIds.has(issueId)) return
    if (draftByIssueId.has(issueId)) return
    draftByIssueId.set(issueId, {
      id: `${INSPIRATION_DRAFT_SERVICE}:${meetingId}:${createdAt.getTime()}:${issueId}`,
      meetingId,
      userId: viewerId,
      service: INSPIRATION_DRAFT_SERVICE,
      title: null,
      promptId: prompt.id,
      content: tagIssueLinks(
        {type: 'doc', content: replaceCalloutsWithBlockquotes(markdownToTipTap(content))},
        serviceByUrl
      ),
      createdAt
    })
  })
  return {
    inspirationItems: [...draftByIssueId.values()],
    issues: numberedIssues.map((numberedIssue) =>
      toInspirationIssue(numberedIssue, draftByIssueId.get(numberedIssue.id) ?? null)
    ),
    nextBefore
  }
}

export default draftRetroFromSources
