import type {GraphQLResolveInfo} from 'graphql'
import {GraphQLError} from 'graphql'
import {markdownToTipTap} from '../../../../../client/shared/tiptap/markdownToTipTap'
import {replaceCalloutsWithBlockquotes} from '../../../../../client/shared/tiptap/replaceCalloutsWithBlockquotes'
import getKysely from '../../../../postgres/getKysely'
import OpenAIServerManager from '../../../../utils/OpenAIServerManager'
import type {GQLContext} from '../../../graphql'
import type {InspirationSourceInput} from '../../resolverTypes'
import type {InspirationItemSource} from '../../types/GenerateInspirationItemsPayload'
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
  context: GQLContext
  info: GraphQLResolveInfo
}

// A retro draft is about one issue, so it travels with that issue. The AI only drafts the few
// items worth raising, and a draft whose column it isn't sure of is dropped, not left for the
// viewer to sort.
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
    context,
    info
  } = options
  const {numberedIssues, issuesText} = await gatherInspirationIssues(
    sources,
    teamId,
    viewerId,
    context,
    info
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
      issues: numberedIssues.map((numberedIssue) => toIssue(numberedIssue, null))
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
      content: {type: 'doc', content: replaceCalloutsWithBlockquotes(markdownToTipTap(content))},
      createdAt
    })
  })
  return {
    inspirationItems: [...draftByIssueId.values()],
    issues: numberedIssues.map((numberedIssue) =>
      toIssue(numberedIssue, draftByIssueId.get(numberedIssue.id) ?? null)
    )
  }
}

export default draftRetroFromSources
