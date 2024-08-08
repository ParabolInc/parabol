import {SuggestedActionInviteYourTeamResolvers} from '../resolverTypes'

const SuggestedActionInviteYourTeam: SuggestedActionInviteYourTeamResolvers = {
  __isTypeOf: ({type}) => type === 'inviteYourTeam',
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default SuggestedActionInviteYourTeam
