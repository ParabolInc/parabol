import type {GraphQLResolveInfo} from 'graphql'
import {GraphQLError} from 'graphql'
import {markdownToTipTap} from '../../../../../client/shared/tiptap/markdownToTipTap'
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
  context: GQLContext
  info: GraphQLResolveInfo
}

interface NumberedIssue {
  id: string
  service: ServiceEnum
  item: InspirationIssue
}

const draftStandupFromSources = async (options: Options) => {
  const {meetingId, teamId, viewerId, viewerName, prompts, sources, userPrompt, context, info} =
    options
  const pg = getKysely()

  const fetched = await Promise.all(
    sources.map(async ({service, searchQuery}) => ({
      service,
      searchQuery,
      items: await fetchIssues(service, searchQuery, teamId, viewerId, context, info)
    }))
  )
  let nextId = 1
  const numbered = fetched.flatMap(({service, items}) =>
    items.map((item): NumberedIssue => ({id: `W${nextId++}`, service, item}))
  )

  if (numbered.length === 0) return {inspirationItems: [], issues: []}

  const issuesText = fetched
    .filter(({items}) => items.length > 0)
    .map(({service, items}) => {
      const ids = numbered.filter((entry) => entry.service === service).map(({id}) => id)
      return `## ${SOURCE_LABELS[service] ?? service}\n\n${formatIssuesForAI(items, ids)}`
    })
    .join('\n\n')

  const pastResponseRows = await pg
    .selectFrom('TeamPromptResponse')
    .select('plaintextContent')
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
    pastResponseRows.map((row) => row.plaintextContent),
    userPrompt
  )
  if (!result) {
    throw new GraphQLError('Unable to draft a response right now. Please try again.')
  }
  await pg.insertInto('AIRequest').values({userId: viewerId, tokenCost: result.tokenCost}).execute()

  const draftText = result.items.map(({content}) => content).join('\n')
  const reasonById = new Map(result.unused.map(({id, reason}) => [id, reason]))
  const issues = numbered.map(({id, service, item}) => {
    const isLinked = !!item.url && draftText.includes(item.url)
    const reason = reasonById.get(id)
    const isUsed = isLinked || (!item.url && !reason)
    return {
      service,
      title: item.title,
      url: item.url || null,
      updatedAt: item.updatedAt,
      unusedReason: isUsed ? null : (reason ?? 'Not mentioned')
    }
  })

  // The AI sometimes splits one question's answer in two, so merge them and keep question order
  const createdAt = new Date()
  const inspirationItems = prompts.flatMap((prompt, promptIndex) => {
    const parts = result.items.filter((item) => item.promptIndex === promptIndex)
    if (parts.length === 0) return []
    const markdown = parts.map(({content}) => content).join('\n\n')
    return [
      {
        id: `${INSPIRATION_DRAFT_SERVICE}:${meetingId}:${prompt.id}`,
        meetingId,
        userId: viewerId,
        service: INSPIRATION_DRAFT_SERVICE,
        title: null,
        promptId: prompt.id,
        content: {type: 'doc', content: markdownToTipTap(markdown)},
        createdAt
      }
    ]
  })
  return {inspirationItems, issues}
}

export default draftStandupFromSources
