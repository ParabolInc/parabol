import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import EstimatePhase from '../../database/types/EstimatePhase'
import EstimateStage from '../../database/types/EstimateStage'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import UpdatePokerScopeItemInput from '../types/UpdatePokerScopeItemInput'
import UpdatePokerScopePayload from '../types/UpdatePokerScopePayload'
import isRecordActiveForMeeting from '../../utils/isRecordActiveForMeeting'

const updatePokerScope = {
  type: GraphQLNonNull(UpdatePokerScopePayload),
  description: `Add or remove a task and its estimate phase from the meeting`,
  args: {
    meetingId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'the meeting with the estimate phases to modify'
    },
    updates: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(UpdatePokerScopeItemInput))),
      description: 'The list of items to add/remove to the estimate phase'
    }
  },
  resolve: async (
    _source,
    {meetingId, updates},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting) {
      return {error: {message: `Meeting not found`}}
    }

    const {
      endedAt,
      teamId,
      facilitatorUserId,
      defaultFacilitatorUserId,
      phases,
      meetingType,
      templateId
    } = meeting
    if (endedAt) {
      return {error: {message: `Meeting already ended`}}
    }
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: `Not on team`}}
    }
    if (viewerId !== facilitatorUserId) {
      if (viewerId !== defaultFacilitatorUserId) {
        return standardError(new Error('Not meeting facilitator'), {userId: viewerId})
      }
      return standardError(new Error('Not meeting facilitator anymore'), {userId: viewerId})
    }

    if (meetingType !== 'poker') {
      return {error: {message: 'Not a poker meeting'}}
    }

    // RESOLUTION
    const estimatePhase = phases.find((phase) => phase.phaseType === 'ESTIMATE') as EstimatePhase
    let stages = estimatePhase.stages
    const allDimensions = await dataLoader.get('templateDimensionsByTemplateId').load(templateId)

    const dimensions = allDimensions.filter((dimension) =>
      isRecordActiveForMeeting(dimension, meeting.createdAt)
    )

    updates.forEach((update) => {
      const {service, serviceTaskId, action} = update

      if (action === 'ADD') {
        const stageExists = !!stages.find((stage) => stage.serviceTaskId === serviceTaskId)
        // see if it already exists. If so, do nothing.
        if (stageExists) return
        const lastSortOrder = stages[stages.length - 1]?.sortOrder ?? -1

        const newStages = dimensions.map(
          (dimension) =>
            new EstimateStage({
              service,
              serviceTaskId,
              sortOrder: lastSortOrder + 1,
              durations: undefined,
              dimensionId: dimension.id
            })
        )
        // MUTATIVE
        stages.push(...newStages)
      } else if (action === 'DELETE') {
        // MUTATIVE
        estimatePhase.stages = stages.filter((stage) => stage.serviceTaskId !== serviceTaskId)
        stages = estimatePhase.stages
      }
    })

    await r
      .table('NewMeeting')
      .get(meetingId)
      .update({
        phases
      })
      .run()

    const data = {meetingId}
    publish(SubscriptionChannel.MEETING, meetingId, 'UpdatePokerScopeSuccess', data, subOptions)
    return data
  }
}

export default updatePokerScope
