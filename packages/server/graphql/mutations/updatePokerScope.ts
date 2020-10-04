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
      meetingType
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
    const {stages} = estimatePhase
    updates.forEach((update) => {
      const {service, serviceTaskId, action} = update
      const existingStageIdx = stages.findIndex((stage) => stage.serviceTaskId === serviceTaskId)
      if (action === 'ADD') {
        // see if it already exists. If so, do nothing.
        if (existingStageIdx !== -1) return
        const lastSortOrder = stages[stages.length - 1]?.sortOrder ?? -1
        const newStage = new EstimateStage({
          service,
          serviceTaskId,
          sortOrder: lastSortOrder + 1,
          durations: undefined
        })
        // MUTATIVE
        stages.push(newStage)
      } else if (action === 'DELETE') {
        if (existingStageIdx === -1) return
        // MUTATIVE
        stages.splice(existingStageIdx, -1)
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
