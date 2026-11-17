import type {InviteToTeamPayloadResolvers, TeamInvitee} from '../resolverTypes'

export type InviteToTeamPayloadSource = {
  teamId: string
  invitees: TeamInvitee[]
  removedSuggestedActionId: string | undefined
}

const InviteToTeamPayload: InviteToTeamPayloadResolvers = {
  team: async ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default InviteToTeamPayload
