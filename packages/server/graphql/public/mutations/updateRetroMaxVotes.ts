import {GraphQLError} from 'graphql'
import {MeetingSettingsThreshold, SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import mode from '../../../../client/utils/mode'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const updateRetroMaxVotes: MutationResolvers['updateRetroMaxVotes'] = async (
  _source,
  {totalVotes, maxVotesPerGroup, meetingId},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})

  const {
    endedAt,
    meetingType,
    phases,
    teamId,
    totalVotes: oldTotalVotes,
    maxVotesPerGroup: oldMaxVotesPerGroup
  } = meeting
  if (meetingType !== 'retrospective')
    throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  if (endedAt) throw new GraphQLError('Meeting already ended', {extensions: {code: 'CONFLICT'}})
  if (isPhaseComplete('vote', phases)) {
    throw new GraphQLError('Vote phase already completed', {extensions: {code: 'CONFLICT'}})
  }

  // VALIDATION
  if (
    totalVotes < maxVotesPerGroup ||
    totalVotes > MeetingSettingsThreshold.RETROSPECTIVE_TOTAL_VOTES_MAX ||
    maxVotesPerGroup < 1 ||
    maxVotesPerGroup > totalVotes
  ) {
    throw new GraphQLError('Invalid max votes', {extensions: {code: 'BAD_USER_INPUT'}})
  }

  const delta = totalVotes - oldTotalVotes

  // RESOLUTION
  await pg.transaction().execute(async (trx) => {
    if (maxVotesPerGroup < oldMaxVotesPerGroup) {
      const reflectionGroups = await trx
        .selectFrom('RetroReflectionGroup')
        .select('voterIds')
        .where('meetingId', '=', meetingId)
        .where('isActive', '=', true)
        .forUpdate()
        .execute()
      const maxVotesPerGroupSpent = Math.max(
        ...reflectionGroups.map(({voterIds}) => mode(voterIds)[0])
      )
      if (maxVotesPerGroupSpent > maxVotesPerGroup)
        throw new GraphQLError('A topic already has too many votes', {
          extensions: {code: 'CONFLICT'}
        })
    }
    if (delta < 0) {
      const res = await trx
        .selectFrom('MeetingMember')
        .select('votesRemaining')
        .where('meetingId', '=', meetingId)
        .forUpdate()
        .execute()
      const min = Math.min(...res.map((m) => Number(m.votesRemaining!)))
      if (min < -delta)
        throw new GraphQLError('Your team has already spent their votes', {
          extensions: {code: 'CONFLICT'}
        })
    }
    await trx
      .updateTable('MeetingMember')
      .set((eb) => ({votesRemaining: eb('votesRemaining', '+', delta)}))
      .where('meetingId', '=', meetingId)
      .execute()
    await trx
      .updateTable('NewMeeting')
      .set({totalVotes, maxVotesPerGroup})
      .where('id', '=', meetingId)
      .execute()
    await trx
      .updateTable('MeetingSettings')
      .set({totalVotes, maxVotesPerGroup})
      .where('teamId', '=', teamId)
      .where('meetingType', '=', 'retrospective')
      .execute()
  })
  dataLoader.get('newMeetings').clear(meetingId)
  const data = {meetingId}
  publish(SubscriptionChannel.MEETING, meetingId, 'UpdateRetroMaxVotesSuccess', data, subOptions)
  return data
}

export default updateRetroMaxVotes
