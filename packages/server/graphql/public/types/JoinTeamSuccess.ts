import {JoinTeamSuccessResolvers} from '../resolverTypes'

export type JoinTeamSuccessSource = {
  teamId: string
  teamMemberId: string
  authToken: string
  invitationNotificationIds?: string[]
  teamLeadUserIdWithNewActions?: string
}

const JoinTeamSuccess: JoinTeamSuccessResolvers = {
  teamId: ({teamId}) => teamId,
  teamMemberId: ({teamMemberId}) => teamMemberId,
  authToken: ({authToken}) => authToken
}

export default JoinTeamSuccess
