import type {TeamPromptResponsesPhaseResolvers} from '../resolverTypes'

const TeamPromptResponsesPhase: TeamPromptResponsesPhaseResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'RESPONSES'
}

export default TeamPromptResponsesPhase
