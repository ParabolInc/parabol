import {GraphQLNonNull} from 'graphql'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import CreatePollPayload from '../types/CreatePollPayload'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

import {GQLContext} from '../graphql'
import CreatePollInput from '../types/CreatePollInput'
import MeetingMemberId from 'parabol-client/shared/gqlIds/MeetingMemberId'

type PollOptionsInputVariables = {
  title: string
}

type CreatePollInputVariables = {
  newPoll: {
    teamId: string
    discussionId: string
    title: string
    threadSortOrder: number
    options: PollOptionsInputVariables[]
  }
}

const createPoll = {
  type: GraphQLNonNull(CreatePollPayload),
  args: {
    newPoll: {
      type: new GraphQLNonNull(CreatePollInput),
      description: 'The new poll including title and poll options'
    }
  },
  resolve: async (
    _source,
    {newPoll}: CreatePollInputVariables,
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH
    const {discussionId, teamId} = newPoll
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: 'Not on team'}}
    }

    const discussion = await dataLoader.get('discussions').load(discussionId)
    if (!discussion) {
      return {error: {message: 'Invalid discussion thread'}}
    }
    const {meetingId} = discussion
    if (!meetingId) {
      return {error: {message: 'Discussion does not take place in a meeting'}}
    }
    const meetingMemberId = MeetingMemberId.join(meetingId, viewerId)
    const [meeting, viewerMeetingMember] = await Promise.all([
      dataLoader.get('newMeetings').load(meetingId),
      dataLoader.get('meetingMembers').load(meetingMemberId)
    ])

    if (!viewerMeetingMember) {
      return {error: {message: 'Not a member of the meeting'}}
    }

    // VALIDATION

    // RESOLUTION
    const data = {}
    // segmentIo.track({
    //   userId: viewerId,
    //   event: 'Poll added',
    //   properties: {
    //     meetingId,
    //     teamId,
    //     isAnonymous,
    //     isAsync,
    //     isReply: !!threadParentId
    //   }
    // })
    publish(SubscriptionChannel.MEETING, meetingId, 'AddPollSuccess', data, subOptions)
    return data
  }
}

export default createPoll
