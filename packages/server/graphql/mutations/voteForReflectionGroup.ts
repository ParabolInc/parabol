import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {VOTE} from 'parabol-client/utils/constants'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import MeetingMemberId from '../../../client/shared/gqlIds/MeetingMemberId'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import VoteForReflectionGroupPayload from '../types/VoteForReflectionGroupPayload'
import safelyCastVote from './helpers/safelyCastVote'
import safelyWithdrawVote from './helpers/safelyWithdrawVote'

export default {
  type: VoteForReflectionGroupPayload,
  description: 'Cast your vote for a reflection group',
  args: {
    isUnvote: {
      type: GraphQLBoolean,
      description: 'true if the user wants to remove one of their votes'
    },
    reflectionGroupId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(
    _source: unknown,
    {isUnvote = false, reflectionGroupId}: {isUnvote: boolean; reflectionGroupId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const viewerId = getUserId(authToken)
    const reflectionGroup = await dataLoader.get('retroReflectionGroups').load(reflectionGroupId)
    if (!reflectionGroup || !reflectionGroup.isActive) {
      return standardError(new Error('Reflection group not found'), {
        userId: viewerId,
        tags: {reflectionGroupId, isUnvote: JSON.stringify(isUnvote)}
      })
    }
    const {meetingId} = reflectionGroup
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'retrospective') {
      return {error: {message: 'Meeting type is not retrospective'}}
    }
    const {endedAt, phases, teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})
    if (isPhaseComplete(VOTE, phases)) {
      return standardError(new Error('Meeting phase already completed'), {userId: viewerId})
    }

    // VALIDATION
    const meetingMemberId = MeetingMemberId.join(meetingId, viewerId)
    const meetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
    if (!meetingMember) {
      return standardError(new Error('Meeting member not found'), {userId: viewerId})
    }

    // RESOLUTION
    dataLoader.get('retroReflectionGroups').clear(reflectionGroupId)
    if (isUnvote) {
      const votingError = await safelyWithdrawVote(meetingId, viewerId, reflectionGroupId)
      if (votingError) return votingError
    } else {
      const votingError = await safelyCastVote(meetingId, viewerId, reflectionGroupId)
      if (votingError) return votingError
    }
    dataLoader.clearAll('meetingMembers')

    const data = {
      meetingId,
      userId: viewerId,
      reflectionGroupId
    }
    publish(
      SubscriptionChannel.MEETING,
      meetingId,
      'VoteForReflectionGroupPayload',
      data,
      subOptions
    )
    return data
  }
}
