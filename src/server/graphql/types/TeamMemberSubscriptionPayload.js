import graphQLSubscriptionType from 'server/graphql/graphQLSubscriptionType'
import InviteTeamMembersPayload from 'server/graphql/types/InviteTeamMembersPayload'
import MeetingCheckInPayload from 'server/graphql/types/MeetingCheckInPayload'
import RemoveTeamMemberPayload from 'server/graphql/types/RemoveTeamMemberPayload'
import RemoveOrgUserPayload from 'server/graphql/types/RemoveOrgUserPayload'
import UpdateUserProfilePayload from 'server/graphql/types/UpdateUserProfilePayload'
import CancelApprovalPayload from 'server/graphql/types/CancelApprovalPayload'
import RejectOrgApprovalPayload from 'server/graphql/types/RejectOrgApprovalPayload'
import AcceptTeamInvitePayload from 'server/graphql/types/AcceptTeamInvitePayload'

const types = [
  AcceptTeamInvitePayload,
  CancelApprovalPayload,
  RemoveTeamMemberPayload,
  InviteTeamMembersPayload,
  MeetingCheckInPayload,
  RejectOrgApprovalPayload,
  RemoveOrgUserPayload,
  UpdateUserProfilePayload
]

export default graphQLSubscriptionType('TeamMemberSubscriptionPayload', types)
