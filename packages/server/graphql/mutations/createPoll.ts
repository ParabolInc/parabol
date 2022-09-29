import {GraphQLNonNull} from 'graphql'
import MeetingMemberId from 'parabol-client/shared/gqlIds/MeetingMemberId'
import {Polls, SubscriptionChannel} from 'parabol-client/types/constEnums'
import insertPollWithOptions from '../../postgres/queries/insertPollWithOptions'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import {GQLContext} from '../graphql'
import CreatePollInput from '../types/CreatePollInput'
import CreatePollPayload from '../types/CreatePollPayload'

type PollOptionsInputVariables = {
  title: string
}

type CreatePollInputVariables = {
  newPoll: {
    discussionId: string
    title: string
    threadSortOrder: number
    options: PollOptionsInputVariables[]
  }
}

const createPoll = {
  type: new GraphQLNonNull(CreatePollPayload),
  args: {
    newPoll: {
      type: new GraphQLNonNull(CreatePollInput),
      description: 'The new poll including title and poll options'
    }
  },
  resolve: async (
    _source: unknown,
    {newPoll}: CreatePollInputVariables,
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const {discussionId, threadSortOrder, title, options} = newPoll

    // VALIDATION
    if (title.length < Polls.MIN_TITLE_LENGTH) {
      return {
        error: {
          message: `Poll title too short, provided title is ${title.length}, min ${Polls.MIN_TITLE_LENGTH}`
        }
      }
    }
    if (title.length > Polls.MAX_TITLE_LENGTH) {
      return {
        error: {
          message: `Poll title too long, provided title is ${title.length}, max ${Polls.MAX_TITLE_LENGTH}`
        }
      }
    }
    if (options.length === 0) {
      return {error: {message: 'No poll options provided'}}
    }
    if (options.length < Polls.MIN_OPTIONS) {
      return {
        error: {
          message: `Poll has to have at least ${Polls.MIN_OPTIONS} options, provided ${options.length}`
        }
      }
    }
    if (options.length > Polls.MAX_OPTIONS) {
      return {
        error: {
          message: `Poll can have at most ${Polls.MAX_OPTIONS} options, provided ${options.length}`
        }
      }
    }
    if (options.some((option) => option.title.length === 0)) {
      return {error: {message: 'All options need a title'}}
    }
    const discussion = await dataLoader.get('discussions').load(discussionId)
    if (!discussion) {
      return {error: {message: 'Invalid discussion thread'}}
    }
    const {meetingId, teamId} = discussion
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: 'Not on team'}}
    }
    const meetingMemberId = MeetingMemberId.join(meetingId, viewerId)
    const viewerMeetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
    if (!viewerMeetingMember) {
      return {error: {message: 'Not a member of the meeting'}}
    }

    // RESOLUTION
    const insertPollResult = await insertPollWithOptions({
      poll: {
        createdById: viewerId,
        teamId,
        meetingId,
        discussionId,
        threadSortOrder,
        title
      },
      pollOptions: options
    })
    if (insertPollResult.length === 0) {
      return {error: {message: `Couldn't create a poll`}}
    }

    const {pollId} = insertPollResult[0]!

    const data = {pollId}
    segmentIo.track({
      userId: viewerId,
      event: 'Poll added',
      properties: {
        meetingId,
        teamId
      }
    })
    publish(SubscriptionChannel.MEETING, meetingId, 'CreatePollSuccess', data, subOptions)
    return data
  }
}

export default createPoll
