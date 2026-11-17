import type {ToggleTeamDrawerPayloadResolvers} from '../resolverTypes'

export type ToggleTeamDrawerPayloadSource = {
  teamMemberId: string
}

const ToggleTeamDrawerPayload: ToggleTeamDrawerPayloadResolvers = {
  teamMember: ({teamMemberId}, _args, {dataLoader}) => {
    return dataLoader.get('teamMembers').loadNonNull(teamMemberId)
  }
}

export default ToggleTeamDrawerPayload
