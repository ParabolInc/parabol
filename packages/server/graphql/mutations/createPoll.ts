import {GraphQLNonNull} from 'graphql'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import CreatePollPayload from '../types/CreatePollPayload'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

import {GQLContext} from '../graphql'
import CreatePollInput from '../types/CreatePollInput'
import MeetingMemberId from 'parabol-client/shared/gqlIds/MeetingMemberId'
import insertPoll from '../../postgres/queries/insertPoll'
import insertPollOptions from '../../postgres/queries/insertPollOptions'
import segmentIo from '../../utils/segmentIo'

const MAX_POLL_OPTIONS = 4
const MIN_POLL_OPTIONS = 2
const MAX_TITLE_LENGTH = 100

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
    const {teamId, discussionId, threadSortOrder, title, options} = newPoll

    //AUTH
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: 'Not on team'}}
    }

    // VALIDATION
    if (!title) {
      return {error: {message: 'No poll title provided'}}
    }
    if (title.length > MAX_TITLE_LENGTH) {
      return {
        error: {
          message: `Poll title too long, provided title is ${title.length}, max ${MAX_TITLE_LENGTH}`
        }
      }
    }
    if (options.length === 0) {
      return {error: {message: 'No poll options provided'}}
    }
    if (options.length < MIN_POLL_OPTIONS) {
      return {
        error: {
          message: `Poll has to have at least ${MIN_POLL_OPTIONS} options, provided ${options.length}`
        }
      }
    }
    if (options.length > MAX_POLL_OPTIONS) {
      return {
        error: {
          message: `Poll can have at most ${MAX_POLL_OPTIONS} options, provided ${options.length}`
        }
      }
    }
    if (options.some((option) => !option.title)) {
      return {error: {message: 'All options need a title'}}
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
    const [, viewerMeetingMember] = await Promise.all([
      dataLoader.get('newMeetings').load(meetingId),
      dataLoader.get('meetingMembers').load(meetingMemberId)
    ])
    if (!viewerMeetingMember) {
      return {error: {message: 'Not a member of the meeting'}}
    }

    // RESOLUTION
    const [{id}] = await insertPoll({
      createdById: viewerId,
      teamId,
      meetingId,
      discussionId,
      threadSortOrder,
      title
    })
    await insertPollOptions({pollOptions: options.map(({title}) => ({pollId: id, title}))})

    const data = {pollId: id}
    segmentIo.track({
      userId: viewerId,
      event: 'Poll added',
      properties: {
        meetingId,
        teamId
      }
    })
    publish(SubscriptionChannel.MEETING, meetingId, 'AddPollSuccess', data, subOptions)
    return data
  }
}

export default createPoll
