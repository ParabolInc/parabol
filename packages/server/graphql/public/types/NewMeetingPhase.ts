import GenericMeetingPhase from '../../../database/types/GenericMeetingPhase'
import {augmentDBStage} from '../../resolvers'
import {NewMeetingPhaseResolvers} from '../resolverTypes'

export interface NewMeetingPhaseSource extends GenericMeetingPhase {
  meetingId: string
  teamId: string
}

const NewMeetingPhase: NewMeetingPhaseResolvers = {
  stages: ({meetingId, phaseType, stages, teamId}) => {
    return stages.map((stage) => augmentDBStage(stage, meetingId, phaseType, teamId))
  }
}

export default NewMeetingPhase
