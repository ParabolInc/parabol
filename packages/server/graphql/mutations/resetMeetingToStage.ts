import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import {
  MeetingTypeEnum,
  NewMeetingPhase,
  NewMeetingPhaseTypeEnum
} from 'parabol-client/types/graphql'
import getRethink from '../../database/rethinkDriver'
import createNewMeetingPhases from './helpers/createNewMeetingPhases'
import {phaseTypes as retroPhaseTypes} from '../../database/types/MeetingSettingsRetrospective'

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
    console.log('reflection groups:', reflectionGroups)
    const reflectionGroupIds = reflectionGroups.map((rg) => rg.id)
    console.log('reflection group ids:', reflectionGroupIds)
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
    // we should get this from stage id passed, instead of hardcoding group
    const groupIdx = retroPhaseTypes.indexOf(NewMeetingPhaseTypeEnum.group)
    const createdPhases = (
      await createNewMeetingPhases(meeting.teamId, 0, MeetingTypeEnum.retrospective, dataLoader)
    ).slice(groupIdx + 1)
    const createdPhasesByType = {} as {NewMeetingPhaseTypeEnum: NewMeetingPhase}
    for (const createdPhase of createdPhases) {
      createdPhasesByType[createdPhase.phaseType] = createdPhase
    }
    const newPhases = meeting.phases.map((phase) => {
      if (createdPhasesByType.hasOwnProperty(phase.phaseType)) {
        return createdPhasesByType[phase.phaseType]
      }
      return phase
    })
    await r
      .table('NewMeeting')
      .get(meetingId)
      .update({phases: newPhases})
      .run()
    // TODO: reset votes remaining
    await (r.table('MeetingMember').getAll(meetingId, {index: 'meetingId'}) as any)
      .update({votesRemaining: 5})
      .run()
    return true
  }
}

export default resetMeetingToStage
