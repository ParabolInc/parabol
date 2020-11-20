import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import getRethink from '../../database/rethinkDriver'
import EstimatePhase from '../../database/types/EstimatePhase'
import EstimateUserScore from '../../database/types/EstimateUserScore'
import MeetingPoker from '../../database/types/MeetingPoker'
import updateStage from '../../database/updateStage'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import VoteForPokerStoryPayload from '../types/VoteForPokerStoryPayload'

const removeVoteForUserId = async (userId: string, stageId: string, meetingId: string) => {
  const updater = (estimateStage) =>
    estimateStage.merge({
      scores: estimateStage('scores').deleteAt(
        estimateStage('scores')
          .offsetsOf((score) => score('userId').eq(userId))
          .nth(0)
      )
    })
  return updateStage(meetingId, stageId, updater)
}

const upsertVote = async (vote: EstimateUserScore, stageId: string, meetingId: string) => {
  const r = await getRethink()
  const updater = (estimateStage) =>
    estimateStage.merge({
      scores: r.branch(
        estimateStage('scores')
          .offsetsOf((score) => score('userId').eq(vote.userId))
          .nth(0)
          .default(-1)
          .eq(-1),
        estimateStage('scores').append(vote),
        estimateStage('scores').changeAt(
          estimateStage('scores')
            .offsetsOf((score) => score('userId').eq(vote.userId))
            .nth(0),
          vote
        )
      )
    })
  return updateStage(meetingId, stageId, updater)
}

const voteForPokerStory = {
  type: GraphQLNonNull(VoteForPokerStoryPayload),
  description: 'Cast a vote for the estimated points for a given dimension',
  args: {
    meetingId: {
      type: GraphQLNonNull(GraphQLID)
    },
    stageId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The stage that contains the dimension to vote for'
    },
    score: {
      type: GraphQLString,
      description: 'The label of the scaleValue to vote for. If null, remove the vote'
    }
  },
  resolve: async (
    _source,
    {meetingId, stageId, score},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH
    const meeting = (await dataLoader.get('newMeetings').load(meetingId)) as MeetingPoker
    if (!meeting) {
      return {error: {message: 'Meeting not found'}}
    }
    const {endedAt, phases, meetingType, teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: 'Not on the team'}}
    }
    if (endedAt) {
      return {error: {message: 'Meeting has ended'}}
    }
    if (meetingType !== MeetingTypeEnum.poker) {
      return {error: {message: 'Not a poker meeting'}}
    }
    if (isPhaseComplete(NewMeetingPhaseTypeEnum.ESTIMATE, phases)) {
      return {error: {message: 'Estimate phase is already complete'}}
    }

    // VALIDATION
    const estimatePhase = phases.find(
      (phase) => phase.phaseType === NewMeetingPhaseTypeEnum.ESTIMATE
    )! as EstimatePhase
    const {stages} = estimatePhase
    const stage = stages.find((stage) => stage.id === stageId)
    if (!stage) {
      return {error: {message: 'Invalid stageId provided'}}
    }

    // RESOLUTION
    const {dimensionId} = stage
    const templateDimension = await dataLoader.get('templateDimensions').load(dimensionId)
    const {scaleId} = templateDimension
    const scale = await dataLoader.get('templateScales').load(scaleId)
    const {values} = scale
    if (score) {
      // validate the score is a value on the scale
      const scoreValue = values.find((value) => value.label === score)
      if (!scoreValue) {
        return {error: {value: 'Score does not exists in scale'}}
      }
      const userScore = new EstimateUserScore({userId: viewerId, label: scoreValue.label})
      await upsertVote(userScore, stageId, meetingId)
    } else {
      // undo the vote, remove from array
      await removeVoteForUserId(viewerId, stageId, meetingId)
    }
    dataLoader.get('newMeetings').clear(meetingId)

    const data = {meetingId, stageId}
    publish(SubscriptionChannel.MEETING, meetingId, 'VoteForPokerStorySuccess', data, subOptions)
    return data
  }
}

export default voteForPokerStory
