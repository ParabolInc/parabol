import type {ToggleTeamPrivacyPayloadResolvers} from '../resolverTypes'

export type ToggleTeamPrivacyPayloadSource = {
  teamId: string
}

const ToggleTeamPrivacyPayload: ToggleTeamPrivacyPayloadResolvers = {
  team: async ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default ToggleTeamPrivacyPayload
