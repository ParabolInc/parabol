import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {VOTE} from 'parabol-client/utils/constants'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import MeetingMemberId from '../../../../client/shared/gqlIds/MeetingMemberId'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import safelyCastVote from '../../mutations/helpers/safelyCastVote'
import safelyWithdrawVote from '../../mutations/helpers/safelyWithdrawVote'
import type {MutationResolvers} from '../resolverTypes'

const voteForReflectionGroup: MutationResolvers['voteForReflectionGroup'] = async (
  _source,
  {isUnvote = false, reflectionGroupId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // AUTH
  const viewerId = getUserId(authToken)
  const reflectionGroup = await dataLoader.get('retroReflectionGroups').load(reflectionGroupId)
  if (!reflectionGroup || !reflectionGroup.isActive) {
    throw new GraphQLError('Reflection group not found', {extensions: {code: 'NOT_FOUND'}})
  }
  const {meetingId} = reflectionGroup
  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  if (meeting.meetingType !== 'retrospective')
    throw new GraphQLError('Meeting type is not retrospective', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  const {endedAt, phases} = meeting
  if (endedAt) throw new GraphQLError('Meeting already ended', {extensions: {code: 'CONFLICT'}})
  if (isPhaseComplete(VOTE, phases)) {
    throw new GraphQLError('Meeting phase already completed', {extensions: {code: 'CONFLICT'}})
  }

  // VALIDATION
  const meetingMemberId = MeetingMemberId.join(meetingId, viewerId)
  const meetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
  if (!meetingMember) {
    throw new GraphQLError('Meeting member not found', {extensions: {code: 'NOT_FOUND'}})
  }

  // RESOLUTION
  dataLoader.get('retroReflectionGroups').clear(reflectionGroupId)
  if (isUnvote) {
    await safelyWithdrawVote(meetingId, viewerId, reflectionGroupId)
  } else {
    await safelyCastVote(meetingId, viewerId, reflectionGroupId)
  }
  dataLoader.clearAll('meetingMembers')

  const data = {meetingId, userId: viewerId, reflectionGroupId}
  publish(SubscriptionChannel.MEETING, meetingId, 'VoteForReflectionGroupPayload', data, subOptions)
  return data
}

export default voteForReflectionGroup
