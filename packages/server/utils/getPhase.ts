import GenericMeetingPhase from '../database/types/GenericMeetingPhase'
import EstimatePhase from '../database/types/EstimatePhase'
import AgendaItemsPhase from '../database/types/AgendaItemsPhase'
import CheckInPhase from '../database/types/CheckInPhase'
import DiscussPhase from '../database/types/DiscussPhase'
import ReflectPhase from '../database/types/ReflectPhase'
import UpdatesPhase from '../database/types/UpdatesPhase'

interface PhaseTypeLookup {
  agendaitems: AgendaItemsPhase
  checkin: CheckInPhase
  discuss: DiscussPhase
  ESTIMATE: EstimatePhase
  reflect: ReflectPhase
  updates: UpdatesPhase
}

const getPhase = <T extends keyof PhaseTypeLookup>(phases: GenericMeetingPhase[], phaseType: T) => {
  return phases.find((phase) => phase.phaseType === phaseType) as PhaseTypeLookup[T]
}

export default getPhase
