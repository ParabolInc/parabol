import {JoinTeamSuccessResolvers} from '../resolverTypes'

export type JoinTeamSuccessSource = {
  teamId: string
}

const JoinTeamSuccess: JoinTeamSuccessResolvers = {
  team: async ({teamId}, _args, {dataLoader}) => {
    console.log('🚀 ~ <><><> teamId:', teamId)
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default JoinTeamSuccess
