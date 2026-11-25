import type {JSONContent} from '@tiptap/core'
import type {GraphQLResolveInfo} from 'graphql'
import {GraphQLError} from 'graphql'
import {markdownToTipTap} from '../../../../../client/shared/tiptap/markdownToTipTap'
import {replaceCalloutsWithBlockquotes} from '../../../../../client/shared/tiptap/replaceCalloutsWithBlockquotes'
import tagIssueLinks from '../../../../../client/shared/tiptap/tagIssueLinks'
import {tipTapToMarkdown} from '../../../../../client/shared/tiptap/tipTapToMarkdown'
import getKysely from '../../../../postgres/getKysely'
import loadTeamBriefing from '../../../../utils/loadTeamBriefing'
import OpenAIServerManager from '../../../../utils/OpenAIServerManager'
import type {GQLContext} from '../../../graphql'
import type {InspirationSourceInput} from '../../resolverTypes'
import gatherInspirationIssues, {
  formatNumberedIssues,
  INSPIRATION_DRAFT_SERVICE
} from './gatherInspirationIssues'
import toInspirationIssue from './toInspirationIssue'

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

const draftStandupFromSources = async (options: Options) => {
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
  const pg = getKysely()

  const {numberedIssues} = await gatherInspirationIssues(
    sources,
    teamId,
    viewerId,
    context,
    info,
    null
  )

  const issueCount = numberedIssues.length
  if (issueCount === 0) return {inspirationItems: [], issues: [], issueCount}
  if (!canDraft) {
    return {
      inspirationItems: [],
      issues: numberedIssues.map((numberedIssue) => toInspirationIssue(numberedIssue)),
      issueCount
    }
  }

  const [pastResponseRows, teamBriefing] = await Promise.all([
    pg
      .selectFrom('TeamPromptResponse')
      .select('content')
      .where('userId', '=', viewerId)
      .where('meetingId', '!=', meetingId)
      .where('plaintextContent', '!=', '')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .execute(),
    loadTeamBriefing(teamId, context.dataLoader)
  ])

  const manager = new OpenAIServerManager()
  const result = await manager.generateInspirationDraft(
    formatNumberedIssues(numberedIssues),
    prompts.map(({question, description}) => ({question, description})),
    viewerName,
    pastResponseRows.map((row) => tipTapToMarkdown(row.content as JSONContent)),
    userPrompt,
    teamBriefing
  )
  if (!result) {
    throw new GraphQLError('Unable to draft a response right now. Please try again.', {
      extensions: {code: 'SERVICE_UNAVAILABLE'}
    })
  }
  await pg.insertInto('AIRequest').values({userId: viewerId, tokenCost: result.tokenCost}).execute()

  const draftText = result.items.map(({content}) => content).join('\n')
  const reasonById = new Map(result.unused.map(({id, reason}) => [id, reason]))
  const issues = numberedIssues.map((numberedIssue) => {
    const {url} = numberedIssue.issue
    const isLinked = !!url && draftText.includes(url)
    const reason = reasonById.get(numberedIssue.id)
    const isUsed = isLinked || (!url && !reason)
    return toInspirationIssue(numberedIssue, isUsed ? null : (reason ?? 'Not mentioned'))
  })

  const serviceByUrl = new Map(
    numberedIssues.flatMap(({service, issue}) => (issue.url ? [[issue.url, service] as const] : []))
  )
  // The AI sometimes splits one question's answer in two, so merge them and keep question order
  const createdAt = new Date()
  const inspirationItems = prompts.flatMap((prompt, promptIndex) => {
    const answers = result.items.filter((answer) => answer.promptIndex === promptIndex)
    if (answers.length === 0) return []
    const markdown = answers.map(({content}) => content).join('\n\n')
    return [
      {
        id: `${INSPIRATION_DRAFT_SERVICE}:${meetingId}:${prompt.id}`,
        service: INSPIRATION_DRAFT_SERVICE,
        title: null,
        promptId: prompt.id,
        content: tagIssueLinks(
          {type: 'doc', content: replaceCalloutsWithBlockquotes(markdownToTipTap(markdown))},
          serviceByUrl
        ),
        createdAt,
        issues: numberedIssues.flatMap((numberedIssue) => {
          const {url} = numberedIssue.issue
          return url && markdown.includes(url) ? [toInspirationIssue(numberedIssue)] : []
        })
      }
    ]
  })
  return {inspirationItems, issues, issueCount}
}

export default draftStandupFromSources
