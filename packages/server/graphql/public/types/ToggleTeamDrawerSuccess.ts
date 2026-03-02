import type {ToggleTeamDrawerSuccessResolvers} from '../resolverTypes'

export type ToggleTeamDrawerSuccessSource = {
  teamMemberId: string
}

const ToggleTeamDrawerSuccess: ToggleTeamDrawerSuccessResolvers = {
  teamMember: ({teamMemberId}, _args, {dataLoader}) => {
    return dataLoader.get('teamMembers').loadNonNull(teamMemberId)
  }
}

export default ToggleTeamDrawerSuccess
