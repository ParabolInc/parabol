import type {InviteToTeamSuccessResolvers, TeamInvitee} from '../resolverTypes'

export type InviteToTeamSuccessSource = {
  teamId: string
  invitees: TeamInvitee[]
  removedSuggestedActionId: string | undefined
}

const InviteToTeamSuccess: InviteToTeamSuccessResolvers = {
  team: async ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default InviteToTeamSuccess
