import {GQLContext} from './../graphql'
import GenericMeetingStage from '../../database/types/GenericMeetingStage'
import GenericMeetingPhase, {
  NewMeetingPhaseTypeEnum
} from '../../database/types/GenericMeetingPhase'
import {augmentDBStage} from '../resolvers'

const resolveStage = (phaseType: NewMeetingPhaseTypeEnum) => async (
  {meetingId, stageId}: {meetingId: string; stageId: string},
  _args: unknown,
  {dataLoader}: GQLContext
) => {
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  const {phases, teamId} = meeting
  const phase = phases.find((phase: GenericMeetingPhase) => phase.phaseType === phaseType)!
  const {stages} = phase
  const dbStage = stages.find((stage: GenericMeetingStage) => stage.id === stageId)!
  return augmentDBStage(dbStage, meetingId, phaseType, teamId)
}

export default resolveStage
