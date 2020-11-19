import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {
  MeetingTypeEnum,
  NewMeetingPhaseTypeEnum,
  TaskServiceEnum
} from 'parabol-client/types/graphql'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import getRethink from '../../database/rethinkDriver'
import EstimatePhase from '../../database/types/EstimatePhase'
import MeetingPoker from '../../database/types/MeetingPoker'
import updateStage from '../../database/updateStage'
import AtlassianServerManager from '../../utils/AtlassianServerManager'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import PokerSetFinalScorePayload from '../types/PokerSetFinalScorePayload'

const pokerSetFinalScore = {
  type: GraphQLNonNull(PokerSetFinalScorePayload),
  description: 'Update the final score field & push to the associated integration',
  args: {
    meetingId: {
      type: GraphQLNonNull(GraphQLID)
    },
    stageId: {
      type: GraphQLNonNull(GraphQLID)
    },
    finalScore: {
      description:
        'A string representation of the final score. It may not have an associated value in the scale',
      type: GraphQLNonNull(GraphQLString)
    }
  },
  resolve: async (
    _source,
    {meetingId, stageId, finalScore},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH
    const meeting = (await dataLoader.get('newMeetings').load(meetingId)) as MeetingPoker
    if (!meeting) {
      return {error: {message: 'Meeting not found'}}
    }
    const {
      endedAt,
      phases,
      meetingType,
      teamId,
      defaultFacilitatorUserId,
      facilitatorUserId
    } = meeting
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
    if (viewerId !== facilitatorUserId) {
      if (viewerId !== defaultFacilitatorUserId) {
        return {
          error: {message: 'Not meeting facilitator'}
        }
      }
      return {
        error: {message: 'Not meeting facilitator anymore'}
      }
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
    if (finalScore.length > 5) {
      return {error: {message: 'Score is too long'}}
    }

    // RESOLUTION
    // update cache
    stage.finalScore = finalScore
    // update stage in DB
    const updater = (estimateStage) => estimateStage.merge({finalScore})
    await updateStage(meetingId, stageId, updater)
    // update integration
    const {creatorUserId, dimensionId, service, serviceTaskId} = stage
    const dimension = await dataLoader.get('templateDimensions').load(dimensionId)
    const {name: dimensionName, scaleId} = dimension
    if (service === TaskServiceEnum.jira) {
      const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId: creatorUserId})
      if (!auth) {
        return {error: {message: 'User no longer has access to Atlassian'}}
      }
      const {accessToken} = auth
      const [cloudId, issueKey] = serviceTaskId.split(':')
      const manager = new AtlassianServerManager(accessToken)
      await manager.updateStoryPoints(cloudId, issueKey, finalScore, dimensionName)
    } else {
      // this is a parabol task
      const scale = await dataLoader.get('templateScales').load(scaleId)
      const {values} = scale
      const resolvedValue = values.find((value) => value.label === finalScore)
      const value = isNaN(Number(resolvedValue)) ? undefined : Number(resolvedValue)
      await r
        .table('Task')
        .get(serviceTaskId)
        .update((row) => ({
          estimates: row('estimates')
            .default([])
            .append({
              name: dimensionName,
              label: finalScore,
              value
            })
        }))
        .run()
    }

    const data = {meetingId, stageId}
    publish(SubscriptionChannel.MEETING, meetingId, 'PokerSetFinalScoreSuccess', data, subOptions)
    return data
  }
}

export default pokerSetFinalScore
