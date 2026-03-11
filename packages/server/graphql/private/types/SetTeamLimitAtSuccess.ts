import type {SetTeamLimitAtSuccessResolvers} from '../resolverTypes'

export type SetTeamLimitAtSuccessSource = {
  teamId: string
}

const SetTeamLimitAtSuccess: SetTeamLimitAtSuccessResolvers = {
  team: ({teamId}, _args, {dataLoader}) => dataLoader.get('teams').loadNonNull(teamId)
}

export default SetTeamLimitAtSuccess
