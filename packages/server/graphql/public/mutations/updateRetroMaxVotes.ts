import {MeetingSettingsThreshold, SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import mode from '../../../../client/utils/mode'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const updateRetroMaxVotes: MutationResolvers['updateRetroMaxVotes'] = async (
  _source,
  {totalVotes, maxVotesPerGroup, meetingId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) return {error: {message: 'Meeting not found'}}

  const {
    endedAt,
    meetingType,
    phases,
    teamId,
    totalVotes: oldTotalVotes,
    maxVotesPerGroup: oldMaxVotesPerGroup
  } = meeting
  if (meetingType !== 'retrospective') return {error: {message: 'Meeting not found'}}
  if (endedAt) return {error: {message: 'Meeting already ended'}}
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }
  if (isPhaseComplete('vote', phases)) {
    return standardError(new Error('Vote phase already completed'), {userId: viewerId})
  }

  // VALIDATION
  if (
    totalVotes < maxVotesPerGroup ||
    totalVotes > MeetingSettingsThreshold.RETROSPECTIVE_TOTAL_VOTES_MAX ||
    maxVotesPerGroup < 1 ||
    maxVotesPerGroup > totalVotes
  ) {
    return standardError(new Error('Invalid max votes'), {
      userId: viewerId,
      tags: {totalVotes, maxVotesPerGroup}
    })
  }

  const delta = totalVotes - oldTotalVotes

  // RESOLUTION
  try {
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
          throw new Error('A topic already has too many votes')
      }
      if (delta < 0) {
        const res = await trx
          .selectFrom('MeetingMember')
          .select('votesRemaining')
          .where('meetingId', '=', meetingId)
          .forUpdate()
          .execute()
        const min = Math.min(...res.map((m) => Number(m.votesRemaining!)))
        if (min < -delta) throw new Error('Your team has already spent their votes')
      }
      await trx
        .with('MeetingMemberUpdates', (qb) =>
          qb
            .updateTable('MeetingMember')
            .set((eb) => ({votesRemaining: eb('votesRemaining', '+', delta)}))
            .where('meetingId', '=', meetingId)
        )
        .with('NewMeetingUpdates', (qb) =>
          qb
            .updateTable('NewMeeting')
            .set({totalVotes, maxVotesPerGroup})
            .where('id', '=', meetingId)
        )
        .updateTable('MeetingSettings')
        .set({totalVotes, maxVotesPerGroup})
        .where('teamId', '=', teamId)
        .where('meetingType', '=', 'retrospective')
        .executeTakeFirstOrThrow()
    })
  } catch (e) {
    return {error: {message: (e as Error).message}}
  }
  dataLoader.get('newMeetings').clear(meetingId)
  const data = {meetingId}
  publish(SubscriptionChannel.MEETING, meetingId, 'UpdateRetroMaxVotesSuccess', data, subOptions)
  return data
}

export default updateRetroMaxVotes
