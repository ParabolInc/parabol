import graphQLSubscriptionType from 'server/graphql/graphQLSubscriptionType'
import AcceptTeamInvitePayload from 'server/graphql/types/AcceptTeamInvitePayload'
import ApproveToOrgPayload from 'server/graphql/types/ApproveToOrgPayload'
import CancelTeamInvitePayload from 'server/graphql/types/CancelTeamInvitePayload'
import InviteTeamMembersPayload from 'server/graphql/types/InviteTeamMembersPayload'
import ResendTeamInvitePayload from 'server/graphql/types/ResendTeamInvitePayload'

const types = [
  AcceptTeamInvitePayload,
  ApproveToOrgPayload,
  CancelTeamInvitePayload,
  InviteTeamMembersPayload,
  ResendTeamInvitePayload
]

export default graphQLSubscriptionType('InvitationSubscriptionPayload', types)
