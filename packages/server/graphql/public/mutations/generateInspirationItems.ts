import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {markdownToTipTap} from '../../../../client/shared/tiptap/markdownToTipTap'
import {USER_AI_TOKENS_MONTHLY_LIMIT} from '../../../postgres/constants'
import getKysely from '../../../postgres/getKysely'
import {selectInspirationItems} from '../../../postgres/select'
import {getUserId, isSuperUser} from '../../../utils/authorization'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import canAccessAI from '../../mutations/helpers/canAccessAI'
import type {MutationResolvers} from '../resolverTypes'
import fetchGitHubWorkItems from './helpers/fetchGitHubWorkItems'

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
  if (meeting.meetingType !== 'teamPrompt') {
    throw new GraphQLError('Inspiration items are only available in standup meetings')
  }
  const {teamId, meetingPrompt} = meeting

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
  } else {
    throw new GraphQLError(`Inspiration items are not yet supported for ${service}`)
  }

  if (!workItemsText.trim()) {
    throw new GraphQLError(
      'No work was found to draft a response from. Try adjusting your filters or date range.'
    )
  }

  const viewer = await dataLoader.get('users').loadNonNull(viewerId)

  // Pull the viewer's most recent answers from other standups to use as a style guide
  const pastResponseRows = await pg
    .selectFrom('TeamPromptResponse')
    .select('plaintextContent')
    .where('userId', '=', viewerId)
    .where('meetingId', '!=', meetingId)
    .where('plaintextContent', '!=', '')
    .orderBy('createdAt', 'desc')
    .limit(5)
    .execute()
  const pastResponses = pastResponseRows.map((row) => row.plaintextContent)

  const manager = new OpenAIServerManager()
  const result = await manager.generateInspirationItems(
    workItemsText,
    meetingPrompt,
    viewer.preferredName,
    pastResponses,
    userPrompt
  )
  if (!result) {
    throw new GraphQLError('Unable to draft a response right now. Please try again.')
  }

  await pg.insertInto('AIRequest').values({userId: viewerId, tokenCost: result.tokenCost}).execute()

  if (result.items.length === 0) {
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
        result.items.map((item) => ({
          meetingId,
          userId: viewerId,
          service,
          title: item.title,
          content: JSON.stringify({type: 'doc', content: markdownToTipTap(item.content)})
        }))
      )
      .execute()
  })
  dataLoader.get('inspirationItemsByMeeting').clear({meetingId, userId: viewerId, service})

  // Re-read through the select helper so content is typed as a tiptap doc (JSONContent)
  const inspirationItems = await selectInspirationItems()
    .where('meetingId', '=', meetingId)
    .where('userId', '=', viewerId)
    .where('service', '=', service)
    .orderBy('createdAt', 'asc')
    .execute()

  return {meetingId, inspirationItems}
}

export default generateInspirationItems
