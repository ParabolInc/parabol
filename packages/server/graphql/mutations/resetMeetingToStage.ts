import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import {NewMeetingPhase, NewMeetingStage} from 'parabol-client/types/graphql'
import getRethink from '../../database/rethinkDriver'
import createNewMeetingPhases from './helpers/createNewMeetingPhases'

const resetMeetingToStage = {
  type: GraphQLNonNull(GraphQLBoolean),
  description: `Reset meeting to a previously completed stage`,
  args: {
    meetingId: {
      type: GraphQLNonNull(GraphQLID)
    },
    stageId: {
      type: GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (_source, {meetingId, stageId}, {dataLoader}) => {
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
    const newPhases = [] as NewMeetingPhase[]
    for (const [phaseIndex, phase] of meeting.phases.entries()) {
      if (!phase.stages) continue
      const newStages = [] as NewMeetingStage[]
      for (const [stageIndex, stage] of phase.stages.entries()) {
        if (stage.id === stageId) shouldResetStage = true
        if (!shouldResetStage) {
          newStages.push(stage as NewMeetingStage)
          continue
        }
        const resettedStage = createdPhases[phaseIndex]?.stages[stageIndex]
        if (!resettedStage) continue
        newStages.push((Object.assign(resettedStage, {id: stage.id}) as unknown) as NewMeetingStage)
      }
      phase.stages = newStages
      newPhases.push(phase as NewMeetingPhase)
    }
    await r
      .table('NewMeeting')
      .get(meetingId)
      .update({phases: newPhases as any})
      .run()
    // TODO: reset votes remaining
    await (r.table('MeetingMember').getAll(meetingId, {index: 'meetingId'}) as any)
      .update({votesRemaining: 5})
      .run()
    return true
  }
}

export default resetMeetingToStage
