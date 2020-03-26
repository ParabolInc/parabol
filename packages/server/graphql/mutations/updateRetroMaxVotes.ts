import {GraphQLID, GraphQLInt, GraphQLNonNull} from 'graphql'
import {MeetingSettingsThreshold, SubscriptionChannel} from 'parabol-client/types/constEnums'
import {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import isPhaseComplete from '../../../client/utils/meetings/isPhaseComplete'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import UpdateRetroMaxVotesPayload from '../types/UpdateRetroMaxVotesPayload'
import RetroMeetingMember from '../../database/types/RetroMeetingMember'
import mode from 'parabol-client/utils/mode'

const updateRetroMaxVotes = {
  type: GraphQLNonNull(UpdateRetroMaxVotesPayload),
  description: `Change the max votes for participants`,
  args: {
    totalVotes: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'The total number of votes for each participant'
    },
    maxVotesPerGroup: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'The total number of votes for each participant to vote on a single topic'
    },
    meetingId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'the meeting to update'
    }
  },
  resolve: async (
    _source,
    {totalVotes, maxVotesPerGroup, meetingId},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH
    const meeting = await r
      .table('NewMeeting')
      .get(meetingId)
      .run()

    if (!meeting) {
      return {error: {message: 'Meeting not found'}}
    }

    const {
      endedAt,
      meetingType,
      phases,
      teamId,
      totalVotes: oldTotalVotes,
      maxVotesPerGroup: oldMaxVotesPerGroup
    } = meeting

    if (meetingType !== MeetingTypeEnum.retrospective) {
      return {error: {message: `Meeting not found`}}
    }

    if (endedAt) {
      return {error: {message: `Meeting already ended`}}
    }

    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    if (isPhaseComplete(NewMeetingPhaseTypeEnum.vote, phases)) {
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

    if (totalVotes < oldTotalVotes) {
      const meetingMembers = (await dataLoader
        .get('meetingMembersByMeetingId')
        .load(meetingId)) as RetroMeetingMember[]
      const maxVotesSpent = Math.max(
        ...meetingMembers.map(({votesRemaining}) => oldTotalVotes - votesRemaining)
      )
      if (maxVotesSpent > totalVotes) {
        return {error: {message: 'Your team has already spent their votes'}}
      }
    }

    if (maxVotesPerGroup < oldMaxVotesPerGroup) {
      const reflectionGroups = await dataLoader
        .get('retroReflectionGroupsByMeetingId')
        .load(meetingId)

      const maxVotesByASingleUser = Math.max(
        ...reflectionGroups.map(({voterIds}) => mode(voterIds)[0])
      )
      if (maxVotesByASingleUser > maxVotesPerGroup) {
        return {error: {message: 'Your team has already spent their votes'}}
      }
    }

    // RESOLUTION
    await Promise.all([
      r
        .table('MeetingSettings')
        .getAll(teamId, {index: 'teamId'})
        .filter({meetingType: MeetingTypeEnum.retrospective})
        .update({
          totalVotes,
          maxVotesPerGroup
        })
        .run(),
      r
        .table('NewMeeting')
        .get(meetingId)
        .update({
          totalVotes,
          maxVotesPerGroup
        })
        .run()
    ])

    const data = {meetingId}
    publish(SubscriptionChannel.MEETING, meetingId, 'UpdateRetroMaxVotesSuccess', data, subOptions)
    return data
  }
}

export default updateRetroMaxVotes
