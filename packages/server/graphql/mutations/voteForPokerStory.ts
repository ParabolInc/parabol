import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {RValue} from '../../database/stricterR'
import EstimateUserScore from '../../database/types/EstimateUserScore'
import MeetingPoker from '../../database/types/MeetingPoker'
import updateStage from '../../database/updateStage'
import {getUserId, isTeamMember} from '../../utils/authorization'
import getPhase from '../../utils/getPhase'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import VoteForPokerStoryPayload from '../types/VoteForPokerStoryPayload'

export const removeVoteForUserId = async (userId: string, stageId: string, meetingId: string) => {
  const updater = (estimateStage: RValue) =>
    estimateStage.merge({
      scores: estimateStage('scores').deleteAt(
        estimateStage('scores')
          .offsetsOf((score: RValue) => score('userId').eq(userId))
          .nth(0)
      )
    })
  return updateStage(meetingId, stageId, 'ESTIMATE', updater)
}

const upsertVote = async (vote: EstimateUserScore, stageId: string, meetingId: string) => {
  const r = await getRethink()
  const updater = (estimateStage: RValue) =>
    estimateStage.merge({
      scores: r.branch(
        estimateStage('scores')
          .offsetsOf((score: RValue) => score('userId').eq(vote.userId))
          .nth(0)
          .default(-1)
          .eq(-1),
        estimateStage('scores').append(vote),
        estimateStage('scores').changeAt(
          estimateStage('scores')
            .offsetsOf((score: RValue) => score('userId').eq(vote.userId))
            .nth(0),
          vote
        )
      )
    })
  return updateStage(meetingId, stageId, 'ESTIMATE', updater)
}

const voteForPokerStory = {
  type: new GraphQLNonNull(VoteForPokerStoryPayload),
  description: 'Cast a vote for the estimated points for a given dimension',
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    stageId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The stage that contains the dimension to vote for'
    },
    score: {
      type: GraphQLString,
      description: 'The label of the scaleValue to vote for. If null, remove the vote'
    }
  },
  resolve: async (
    _source: unknown,
    {meetingId, stageId, score}: {meetingId: string; stageId: string; score?: string},
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
    const {endedAt, phases, meetingType, teamId, templateRefId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: 'Not on the team'}}
    }
    if (endedAt) {
      return {error: {message: 'Meeting has ended'}}
    }
    if (meetingType !== 'poker') {
      return {error: {message: 'Not a poker meeting'}}
    }
    // No need to check for now (https://github.com/ParabolInc/parabol/issues/7191)
    // if (isPhaseComplete('ESTIMATE', phases)) {
    //   return {error: {message: 'Estimate phase is already complete'}}
    // }

    // VALIDATION
    const estimatePhase = getPhase(phases, 'ESTIMATE')
    const {stages} = estimatePhase
    const stage = stages.find((stage) => stage.id === stageId)
    if (!stage) {
      return {error: {message: 'Invalid stageId provided'}}
    }

    // RESOLUTION
    const {dimensionRefIdx} = stage
    const templateRef = await dataLoader.get('templateRefs').loadNonNull(templateRefId)
    const {dimensions} = templateRef
    const dimensionRef = dimensions[dimensionRefIdx]!
    const {scaleRefId} = dimensionRef
    const scaleRef = await dataLoader.get('templateScaleRefs').loadNonNull(scaleRefId)
    const {values} = scaleRef
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
