import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {USER_AI_TOKENS_MONTHLY_LIMIT} from '../../../postgres/constants'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isSuperUser} from '../../../utils/authorization'
import canAccessAI from '../../mutations/helpers/canAccessAI'
import type {MutationResolvers} from '../resolverTypes'
import draftRetroFromSources from './helpers/draftRetroFromSources'
import draftStandupFromSources from './helpers/draftStandupFromSources'

const generateInspirationItems: MutationResolvers['generateInspirationItems'] = async (
  _source,
  {input},
  context,
  info
) => {
  const {authToken, dataLoader} = context
  const {meetingId, sources, userPrompt, before} = input
  const viewerId = getUserId(authToken)

  // VALIDATION
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  if (meeting.endedAt)
    throw new GraphQLError('Meeting already ended', {extensions: {code: 'CONFLICT'}})
  if (meeting.meetingType !== 'teamPrompt' && meeting.meetingType !== 'retrospective') {
    throw new GraphQLError(
      'Inspiration items are only available in standup and retrospective meetings',
      {extensions: {code: 'BAD_USER_INPUT'}}
    )
  }
  if (before && meeting.meetingType !== 'retrospective') {
    throw new GraphQLError('Only a retrospective timeline goes back in pages', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  const {teamId} = meeting

  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const canDraft = !!process.env.OPEN_AI_API_KEY && (await canAccessAI(team, dataLoader, true))

  // AI quota
  const pg = getKysely()
  if (canDraft && !isSuperUser(authToken)) {
    const {tokenUsage} = await pg
      .selectFrom('AIRequest')
      .select(pg.fn.coalesce(pg.fn.sum<bigint>('tokenCost'), sql`0`).as('tokenUsage'))
      .where('userId', '=', viewerId)
      .where('createdAt', '>=', sql<Date>`NOW() - INTERVAL '30 days'`)
      .executeTakeFirstOrThrow()
    if (Number(tokenUsage) >= USER_AI_TOKENS_MONTHLY_LIMIT) {
      throw new GraphQLError(
        'You have exceeded your AI request quota. Please contact sales to increase',
        {extensions: {code: 'TOO_MANY_REQUESTS'}}
      )
    }
  }

  const prompts = await dataLoader.get('templatePromptsByMeetingId').load(meetingId)
  if (prompts.length === 0) {
    throw new GraphQLError('This meeting has no prompts to draft a response for.', {
      extensions: {code: 'CONFLICT'}
    })
  }
  const viewer = await dataLoader.get('users').loadNonNull(viewerId)

  // RESOLUTION
  const draftOptions = {
    meetingId,
    teamId,
    viewerId,
    viewerName: viewer.preferredName,
    prompts,
    sources,
    userPrompt,
    canDraft,
    context,
    info
  }
  const draft =
    meeting.meetingType === 'teamPrompt'
      ? await draftStandupFromSources(draftOptions)
      : await draftRetroFromSources({...draftOptions, before: before ?? null})
  return {meetingId, ...draft}
}

export default generateInspirationItems
