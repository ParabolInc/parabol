import {AgendaItemsPhaseResolvers} from '../resolverTypes'

const AgendaItemsPhase: AgendaItemsPhaseResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'agendaitems'
}

export default AgendaItemsPhase
