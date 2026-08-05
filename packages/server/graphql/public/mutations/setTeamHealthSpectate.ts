import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import MeetingMemberId from '../../../../client/shared/gqlIds/MeetingMemberId'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const setTeamHealthSpectate: MutationResolvers['setTeamHealthSpectate'] = async (
  _source,
  {meetingId, isSpectating},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const pg = getKysely()

  // AUTH
  const meetingMemberId = MeetingMemberId.join(meetingId, viewerId)
  const [meeting, meetingMember] = await Promise.all([
    dataLoader.get('newMeetings').loadNonNull(meetingId),
    dataLoader.get('meetingMembers').load(meetingMemberId)
  ])
  const {endedAt, teamId, meetingType} = meeting
  if (meetingType !== 'teamHealth') {
    throw new GraphQLError('Not a team health meeting')
  }
  if (endedAt) {
    throw new GraphQLError('Meeting has ended')
  }
  if (!meetingMember) {
    throw new GraphQLError('Join the meeting before changing this')
  }

  // RESOLUTION
  // per-meeting only. Unlike poker, this is never persisted back to TeamMember: sitting out one
  // team health check-in shouldn't opt the owner out of the next one
  await pg
    .updateTable('MeetingMember')
    .set({isSpectating})
    .where('id', '=', meetingMemberId)
    .execute()
  dataLoader.clearAll('meetingMembers')
  // mutate the dataLoader cache
  meetingMember.isSpectating = isSpectating

  const data = {meetingId, teamId, userId: viewerId}
  publish(SubscriptionChannel.MEETING, meetingId, 'SetTeamHealthSpectateSuccess', data, subOptions)
  return data
}

export default setTeamHealthSpectate
