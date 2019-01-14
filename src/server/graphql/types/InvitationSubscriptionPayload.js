import graphQLSubscriptionType from 'server/graphql/graphQLSubscriptionType'
import AcceptTeamInvitePayload from 'server/graphql/types/AcceptTeamInvitePayload'
import ApproveToOrgPayload from 'server/graphql/types/ApproveToOrgPayload'
import InviteTeamMembersPayload from 'server/graphql/types/InviteTeamMembersPayload'

const types = [AcceptTeamInvitePayload, ApproveToOrgPayload, InviteTeamMembersPayload]

export default graphQLSubscriptionType('InvitationSubscriptionPayload', types)
