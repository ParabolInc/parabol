import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {markdownToTipTap} from '../../../../client/shared/tiptap/markdownToTipTap'
import {USER_AI_TOKENS_MONTHLY_LIMIT} from '../../../postgres/constants'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isSuperUser} from '../../../utils/authorization'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import canAccessAI from '../../mutations/helpers/canAccessAI'
import type {MutationResolvers} from '../resolverTypes'
import fetchGCalWorkItems from './helpers/fetchGCalWorkItems'
import fetchGitHubWorkItems from './helpers/fetchGitHubWorkItems'
import fetchJiraWorkItems from './helpers/fetchJiraWorkItems'
import fetchLinearWorkItems from './helpers/fetchLinearWorkItems'
import fetchParabolWorkItems from './helpers/fetchParabolWorkItems'

const generateInspirationItems: MutationResolvers['generateInspirationItems'] = async (
  _source,
  {input},
  context,
  info
) => {
  const {authToken, dataLoader} = context
  const {meetingId, service, searchQuery, userPrompt} = input
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

  // RESOLUTION
  // Re-run the same search the user saw, server-side, fetching full content for each item.
  let workItemsText = ''
  if (service === 'github') {
    workItemsText = await fetchGitHubWorkItems(
      teamId,
      viewerId,
      searchQuery,
      dataLoader,
      context,
      info
    )
  } else if (service === 'jira') {
    workItemsText = await fetchJiraWorkItems(teamId, viewerId, searchQuery, dataLoader)
  } else if (service === 'linear') {
    workItemsText = await fetchLinearWorkItems(teamId, viewerId, searchQuery, context, info)
  } else if (service === 'gcal') {
    workItemsText = await fetchGCalWorkItems(teamId, viewerId, searchQuery, dataLoader)
  } else if (service === 'PARABOL') {
    workItemsText = await fetchParabolWorkItems(teamId, viewerId, searchQuery)
  } else {
    throw new GraphQLError(`Inspiration items are not yet supported for ${service}`)
  }

  if (!workItemsText.trim()) {
    throw new GraphQLError(
      'No work was found to draft a response from. Try adjusting your filters or date range.'
    )
  }

  const viewer = await dataLoader.get('users').loadNonNull(viewerId)
  const prompts = await dataLoader.get('templatePromptsByMeetingId').load(meetingId)
  if (prompts.length === 0) {
    throw new GraphQLError('This meeting has no prompts to draft a response for.')
  }

  // The viewer's most recent answers from other standups serve as a style guide
  const pastResponseRows =
    meeting.meetingType === 'teamPrompt'
      ? await pg
          .selectFrom('TeamPromptResponse')
          .select('plaintextContent')
          .where('userId', '=', viewerId)
          .where('meetingId', '!=', meetingId)
          .where('plaintextContent', '!=', '')
          .orderBy('createdAt', 'desc')
          .limit(5)
          .execute()
      : []

  const manager = new OpenAIServerManager()
  const result = await manager.generateInspirationItems(
    meeting.meetingType,
    workItemsText,
    prompts.map(({question, description}) => ({question, description})),
    viewer.preferredName,
    pastResponseRows.map((row) => row.plaintextContent),
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
          content: JSON.stringify({type: 'doc', content: markdownToTipTap(item.content)})
        }))
      )
      .execute()
  })
  dataLoader.get('inspirationItemsByMeeting').clear({meetingId, userId: viewerId, service})

  return {meetingId, service}
}

export default generateInspirationItems
