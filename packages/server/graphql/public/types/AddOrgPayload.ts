import {AddOrgPayloadResolvers} from '../resolverTypes'

export type AddOrgPayloadSource =
  | {
      error?: {message: string}
    }
  | {
      orgId: string
      teamId: string
      teamMemberId: string
      removedSuggestedActionId?: string
    }

const AddOrgPayload: AddOrgPayloadResolvers = {
  team: (source, _args, {dataLoader}) => {
    if (!('teamId' in source)) return null
    const {teamId} = source
    return dataLoader.get('teams').loadNonNull(teamId)
  },
  teamMember: (source, _args, {dataLoader}) => {
    if (!('teamMemberId' in source)) return null
    const {teamMemberId} = source
    return dataLoader.get('teamMembers').loadNonNull(teamMemberId)
  }
}

export default AddOrgPayload
