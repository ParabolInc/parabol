import {ToggleTeamPrivacySuccessResolvers} from '../resolverTypes'

export type ToggleTeamPrivacySuccessSource = {
  teamId: string
}

const ToggleTeamPrivacySuccess: ToggleTeamPrivacySuccessResolvers = {
  team: async ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default ToggleTeamPrivacySuccess
