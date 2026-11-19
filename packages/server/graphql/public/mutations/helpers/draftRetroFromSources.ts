import type {GraphQLResolveInfo} from 'graphql'
import {GraphQLError} from 'graphql'
import {markdownToTipTap} from '../../../../../client/shared/tiptap/markdownToTipTap'
import {replaceCalloutsWithBlockquotes} from '../../../../../client/shared/tiptap/replaceCalloutsWithBlockquotes'
import tagIssueLinks from '../../../../../client/shared/tiptap/tagIssueLinks'
import getKysely from '../../../../postgres/getKysely'
import OpenAIServerManager from '../../../../utils/OpenAIServerManager'
import type {GQLContext} from '../../../graphql'
import type {InspirationSourceInput} from '../../resolverTypes'
import type {InspirationItemSource} from '../../types/InspirationItem'
import gatherInspirationIssues, {
  INSPIRATION_DRAFT_SERVICE,
  type NumberedIssue
} from './gatherInspirationIssues'

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
// viewer to sort. Each call drafts one page of the timeline: the stretch of work just older than `before`.
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
  const {numberedIssues, issuesText, nextBefore} = await gatherInspirationIssues(
    sources,
    teamId,
    viewerId,
    context,
    info,
    {before}
  )

  const toIssue = ({service, issue}: NumberedIssue, draft: InspirationItemSource | null) => ({
    service,
    kind: issue.kind,
    title: issue.title,
    url: issue.url || null,
    updatedAt: issue.updatedAt,
    unusedReason: null,
    draft
  })

  if (numberedIssues.length === 0 || !canDraft) {
    return {
      inspirationItems: [],
      issues: numberedIssues.map((numberedIssue) => toIssue(numberedIssue, null)),
      nextBefore
    }
  }

  const manager = new OpenAIServerManager()
  const result = await manager.generateRetroDrafts(
    issuesText,
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

  const issueIds = new Set(numberedIssues.map(({id}) => id))
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
      toIssue(numberedIssue, draftByIssueId.get(numberedIssue.id) ?? null)
    ),
    nextBefore
  }
}

export default draftRetroFromSources
