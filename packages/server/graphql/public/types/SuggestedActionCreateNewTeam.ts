import {SuggestedActionCreateNewTeamResolvers} from '../resolverTypes'

const SuggestedActionCreateNewTeam: SuggestedActionCreateNewTeamResolvers = {
  __isTypeOf: ({type}) => type === 'createNewTeam'
}

export default SuggestedActionCreateNewTeam
