import type {SetTeamLimitAtPayloadResolvers} from '../resolverTypes'

export type SetTeamLimitAtPayloadSource = {
  teamId: string
}

const SetTeamLimitAtPayload: SetTeamLimitAtPayloadResolvers = {
  team: ({teamId}, _args, {dataLoader}) => dataLoader.get('teams').loadNonNull(teamId)
}

export default SetTeamLimitAtPayload
