import {JoinTeamSuccessResolvers} from '../resolverTypes'

export type JoinTeamSuccessSource = {
  teamId: string
  teamMemberId: string
}

const JoinTeamSuccess: JoinTeamSuccessResolvers = {
  team: async ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  },
  teamMember: async ({teamMemberId}, _args, {dataLoader}) => {
    return dataLoader.get('teamMembers').loadNonNull(teamMemberId)
  }
}

export default JoinTeamSuccess
