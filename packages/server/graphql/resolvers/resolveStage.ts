import {NewMeetingPhaseTypeEnum} from '../../database/types/GenericMeetingPhase'
import {augmentDBStage} from '../resolvers'

const resolveStage = (phaseType: NewMeetingPhaseTypeEnum) => async (
  {meetingId, stageId},
  _args,
  {dataLoader}
) => {
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  const {phases, teamId} = meeting
  const phase = phases.find((phase) => phase.phaseType === phaseType)!
  const {stages} = phase
  const dbStage = stages.find((stage) => stage.id === stageId)!
  return augmentDBStage(dbStage, meetingId, phaseType, teamId)
}

export default resolveStage
