import type {AddTeamPayloadResolvers, TeamInvitee} from '../resolverTypes'

export type AddTeamPayloadSource = {
  orgId: string
  teamId: string
  teamMemberId: string
  removedSuggestedActionId?: string
  invitees?: TeamInvitee[] | null
}

const AddTeamPayload: AddTeamPayloadResolvers = {
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  },
  teamMember: ({teamMemberId}, _args, {dataLoader}) => {
    return dataLoader.get('teamMembers').loadNonNull(teamMemberId)
  }
}

export default AddTeamPayload
