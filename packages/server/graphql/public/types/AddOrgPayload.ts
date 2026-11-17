import type {AddOrgPayloadResolvers, TeamInvitee} from '../resolverTypes'

export type AddOrgPayloadSource = {
  orgId: string
  teamId: string
  teamMemberId: string
  removedSuggestedActionId?: string
  invitees?: TeamInvitee[] | null
}

const AddOrgPayload: AddOrgPayloadResolvers = {
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  },
  teamMember: ({teamMemberId}, _args, {dataLoader}) => {
    return dataLoader.get('teamMembers').loadNonNull(teamMemberId)
  }
}

export default AddOrgPayload
