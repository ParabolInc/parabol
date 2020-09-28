import {GraphQLID, GraphQLNonNull} from 'graphql'
import GenericMeetingPhase from '../../database/types/GenericMeetingPhase'
import GenericMeetingStage from '../../database/types/GenericMeetingStage'
import getRethink from '../../database/rethinkDriver'
import createNewMeetingPhases, {primePhases} from './helpers/createNewMeetingPhases'
import ResetMeetingToStagePayload from '../types/ResetMeetingToStagePayload'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import publish from '../../utils/publish'

const resetMeetingToStage = {
  type: GraphQLNonNull(ResetMeetingToStagePayload),
  description: `Reset meeting to a previously completed stage`,
  args: {
    meetingId: {
      type: GraphQLNonNull(GraphQLID)
    },
    stageId: {
      type: GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (_source, {meetingId, stageId}, {socketId: mutatorId, dataLoader}) => {
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    console.log('meetingId:', meetingId)
    console.log('stageId:', stageId)
    const reflectionGroups = await dataLoader
      .get('retroReflectionGroupsByMeetingId')
      .load(meetingId)
    const reflectionGroupIds = reflectionGroups.map((rg) => rg.id)
    const r = await getRethink()
    await Promise.all([
      r
        .table('Comment')
        .getAll(r.args(reflectionGroupIds), {index: 'threadId'})
        .delete()
        .run(),
      r
        .table('Task')
        .getAll(r.args(reflectionGroupIds), {index: 'threadId'})
        .delete()
        .run(),
      r
        .table('RetroReflectionGroup')
        .getAll(r.args(reflectionGroupIds))
        .update({voterIds: []})
        .run()
    ])
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    const createdPhases = await createNewMeetingPhases(
      meeting.teamId,
      0, // todo: pass real meeting count
      meeting.meetingType,
      dataLoader
    )
    let shouldResetStage = false
    let resetToPhaseIndex = -1
    const newPhases = [] as GenericMeetingPhase[]
    for (const [phaseIndex, phase] of meeting.phases.entries()) {
      if (!phase.stages) continue
      const newStages = [] as GenericMeetingStage[]
      for (const [stageIndex, stage] of phase.stages.entries()) {
        if (stage.id === stageId) {
          shouldResetStage = true
          resetToPhaseIndex = phaseIndex
        }
        if (!shouldResetStage) {
          newStages.push(stage)
          continue
        }
        const resettedStage = createdPhases[phaseIndex]?.stages[stageIndex]
        if (!resettedStage) continue
        newStages.push(Object.assign(resettedStage, {id: stage.id}))
      }
      phase.stages = newStages
      newPhases.push(phase)
    }
    primePhases(newPhases, resetToPhaseIndex)

    await r
      .table('NewMeeting')
      .get(meetingId)
      .update({phases: newPhases})
      .run()
    // TODO: reset votes remaining
    await (r.table('MeetingMember').getAll(meetingId, {index: 'meetingId'}) as any)
      .update({votesRemaining: meeting.totalVotes})
      .run()
    const data = {
      meetingId
    }
    publish(SubscriptionChannel.MEETING, meetingId, 'ResetMeetingToStagePayload', data, subOptions)
    return data
  }
}

export default resetMeetingToStage
