import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {markdownToTipTap} from '../../../../client/shared/tiptap/markdownToTipTap'
import {USER_AI_TOKENS_MONTHLY_LIMIT} from '../../../postgres/constants'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isSuperUser} from '../../../utils/authorization'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import canAccessAI from '../../mutations/helpers/canAccessAI'
import type {MutationResolvers} from '../resolverTypes'
import draftStandupFromSources from './helpers/draftStandupFromSources'
import fetchIssues from './helpers/fetchIssues'
import {formatIssuesForAI} from './helpers/issuesForAI'

const toTipTapDoc = (markdown: string) =>
  JSON.stringify({type: 'doc', content: markdownToTipTap(markdown)})

const generateInspirationItems: MutationResolvers['generateInspirationItems'] = async (
  _source,
  {input},
  context,
  info
) => {
  const {authToken, dataLoader} = context
  const {meetingId, sources, userPrompt} = input
  const viewerId = getUserId(authToken)

  // VALIDATION
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) throw new GraphQLError('Meeting not found')
  if (meeting.endedAt) throw new GraphQLError('Meeting already ended')
  if (meeting.meetingType !== 'teamPrompt' && meeting.meetingType !== 'retrospective') {
    throw new GraphQLError(
      'Inspiration items are only available in standup and retrospective meetings'
    )
  }
  if (meeting.meetingType === 'retrospective' && sources.length !== 1) {
    throw new GraphQLError('A retrospective drafts from one source at a time')
  }
  const {teamId} = meeting

  const team = await dataLoader.get('teams').loadNonNull(teamId)
  if (!(await canAccessAI(team, dataLoader, true))) {
    throw new GraphQLError('AI features are not enabled for this organization')
  }

  // AI quota
  const pg = getKysely()
  if (!isSuperUser(authToken)) {
    const {tokenUsage} = await pg
      .selectFrom('AIRequest')
      .select(pg.fn.coalesce(pg.fn.sum<bigint>('tokenCost'), sql`0`).as('tokenUsage'))
      .where('userId', '=', viewerId)
      .where('createdAt', '>=', sql<Date>`NOW() - INTERVAL '30 days'`)
      .executeTakeFirstOrThrow()
    if (Number(tokenUsage) >= USER_AI_TOKENS_MONTHLY_LIMIT) {
      throw new GraphQLError(
        'You have exceeded your AI request quota. Please contact sales to increase'
      )
    }
  }

  const prompts = await dataLoader.get('templatePromptsByMeetingId').load(meetingId)
  if (prompts.length === 0) {
    throw new GraphQLError('This meeting has no prompts to draft a response for.')
  }
  const viewer = await dataLoader.get('users').loadNonNull(viewerId)

  // RESOLUTION
  if (meeting.meetingType === 'teamPrompt') {
    const draft = await draftStandupFromSources({
      meetingId,
      teamId,
      viewerId,
      viewerName: viewer.preferredName,
      prompts,
      sources,
      userPrompt,
      context,
      info
    })
    return {meetingId, ...draft}
  }

  // Re-run the same search the user saw, server-side, fetching full content for each item.
  const {service, searchQuery} = sources[0]!
  const issues = await fetchIssues(service, searchQuery, teamId, viewerId, context, info)
  const issuesText = formatIssuesForAI(issues)

  if (!issuesText.trim()) {
    await pg
      .deleteFrom('InspirationItem')
      .where('meetingId', '=', meetingId)
      .where('userId', '=', viewerId)
      .where('service', '=', service)
      .execute()
    dataLoader.get('inspirationItemsByMeeting').clear({meetingId, userId: viewerId, service})
    return {meetingId, inspirationItems: [], issues: []}
  }

  const manager = new OpenAIServerManager()
  const result = await manager.generateInspirationItems(
    issuesText,
    prompts.map(({question, description}) => ({question, description})),
    viewer.preferredName,
    userPrompt
  )
  if (!result) {
    throw new GraphQLError('Unable to draft a response right now. Please try again.')
  }
  const {tokenCost} = result
  const generatedItems = result.items.map((item) => ({
    title: item.title,
    content: item.content,
    promptId: prompts[item.promptIndex]!.id
  }))

  await pg.insertInto('AIRequest').values({userId: viewerId, tokenCost}).execute()

  if (generatedItems.length === 0) {
    throw new GraphQLError('No suggestions could be drafted from your work. Please try again.')
  }

  // Replace any previous generation for this (meeting, viewer, service). OpenAI returns
  // markdown; store it as a tiptap doc so it can be merged losslessly into a meeting response.
  await pg.transaction().execute(async (trx) => {
    await trx
      .deleteFrom('InspirationItem')
      .where('meetingId', '=', meetingId)
      .where('userId', '=', viewerId)
      .where('service', '=', service)
      .execute()
    await trx
      .insertInto('InspirationItem')
      .values(
        generatedItems.map((item) => ({
          meetingId,
          userId: viewerId,
          service,
          title: item.title,
          promptId: item.promptId,
          content: toTipTapDoc(item.content)
        }))
      )
      .execute()
  })
  dataLoader.get('inspirationItemsByMeeting').clear({meetingId, userId: viewerId, service})
  const inspirationItems = await dataLoader
    .get('inspirationItemsByMeeting')
    .load({meetingId, userId: viewerId, service})

  return {meetingId, inspirationItems, issues: []}
}

export default generateInspirationItems
