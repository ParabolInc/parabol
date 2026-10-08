import type {JSONContent} from '@tiptap/core'
import type {GraphQLResolveInfo} from 'graphql'
import {GraphQLError} from 'graphql'
import {markdownToTipTap} from '../../../../../client/shared/tiptap/markdownToTipTap'
import tagIssueLinks from '../../../../../client/shared/tiptap/tagIssueLinks'
import {tipTapToMarkdown} from '../../../../../client/shared/tiptap/tipTapToMarkdown'
import getKysely from '../../../../postgres/getKysely'
import OpenAIServerManager from '../../../../utils/OpenAIServerManager'
import type {GQLContext} from '../../../graphql'
import type {InspirationSourceInput, ServiceEnum} from '../../resolverTypes'
import fetchIssues from './fetchIssues'
import {formatIssuesForAI, type InspirationIssue} from './issuesForAI'

const SOURCE_LABELS: Partial<Record<ServiceEnum, string>> = {
  PARABOL: 'Parabol',
  github: 'GitHub',
  jira: 'Jira',
  linear: 'Linear',
  gcal: 'Google Calendar'
}

// A standup's draft combines every source, so its items share this key instead of a service
const INSPIRATION_DRAFT_SERVICE = 'draft'

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

interface NumberedIssue {
  id: string
  service: ServiceEnum
  issue: InspirationIssue
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

  const issuesBySource = await Promise.all(
    sources.map(async ({service, searchQuery}) => ({
      service,
      searchQuery,
      sourceIssues: await fetchIssues(service, searchQuery, teamId, viewerId, context, info)
    }))
  )
  let nextId = 1
  const numberedIssues = issuesBySource.flatMap(({service, sourceIssues}) =>
    sourceIssues.map((issue): NumberedIssue => ({id: `W${nextId++}`, service, issue}))
  )

  const toIssue = ({service, issue}: NumberedIssue, unusedReason: string | null) => ({
    service,
    title: issue.title,
    url: issue.url || null,
    updatedAt: issue.updatedAt,
    unusedReason
  })

  if (numberedIssues.length === 0) return {inspirationItems: [], issues: []}
  if (!canDraft) {
    return {
      inspirationItems: [],
      issues: numberedIssues.map((numberedIssue) => toIssue(numberedIssue, null))
    }
  }

  const issuesText = issuesBySource
    .filter(({sourceIssues}) => sourceIssues.length > 0)
    .map(({service, sourceIssues}) => {
      const ids = numberedIssues
        .filter((numberedIssue) => numberedIssue.service === service)
        .map(({id}) => id)
      return `## ${SOURCE_LABELS[service] ?? service}\n\n${formatIssuesForAI(sourceIssues, ids)}`
    })
    .join('\n\n')

  const pastResponseRows = await pg
    .selectFrom('TeamPromptResponse')
    .select('content')
    .where('userId', '=', viewerId)
    .where('meetingId', '!=', meetingId)
    .where('plaintextContent', '!=', '')
    .orderBy('createdAt', 'desc')
    .limit(5)
    .execute()

  const manager = new OpenAIServerManager()
  const result = await manager.generateInspirationDraft(
    issuesText,
    prompts.map(({question, description}) => ({question, description})),
    viewerName,
    pastResponseRows.map((row) => tipTapToMarkdown(row.content as JSONContent)),
    userPrompt
  )
  if (!result) {
    throw new GraphQLError('Unable to draft a response right now. Please try again.')
  }
  await pg.insertInto('AIRequest').values({userId: viewerId, tokenCost: result.tokenCost}).execute()

  const draftText = result.items.map(({content}) => content).join('\n')
  const reasonById = new Map(result.unused.map(({id, reason}) => [id, reason]))
  const issues = numberedIssues.map((numberedIssue) => {
    const {url} = numberedIssue.issue
    const isLinked = !!url && draftText.includes(url)
    const reason = reasonById.get(numberedIssue.id)
    const isUsed = isLinked || (!url && !reason)
    return toIssue(numberedIssue, isUsed ? null : (reason ?? 'Not mentioned'))
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
        meetingId,
        userId: viewerId,
        service: INSPIRATION_DRAFT_SERVICE,
        title: null,
        promptId: prompt.id,
        content: tagIssueLinks({type: 'doc', content: markdownToTipTap(markdown)}, serviceByUrl),
        createdAt
      }
    ]
  })
  return {inspirationItems, issues}
}

export default draftStandupFromSources
