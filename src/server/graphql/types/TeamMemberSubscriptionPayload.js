import graphQLSubscriptionType from 'server/graphql/graphQLSubscriptionType';
import InviteTeamMembersPayload from 'server/graphql/types/InviteTeamMembersPayload';
import MeetingCheckInPayload from 'server/graphql/types/MeetingCheckInPayload';
import PromoteToTeamLeadPayload from 'server/graphql/types/PromoteToTeamLeadPayload';
import RemoveTeamMemberPayload from 'server/graphql/types/RemoveTeamMemberPayload';
import RemoveOrgUserPayload from 'server/graphql/types/RemoveOrgUserPayload';
import UpdateUserProfilePayload from 'server/graphql/types/UpdateUserProfilePayload';
import CancelApprovalPayload from 'server/graphql/types/CancelApprovalPayload';
import RejectOrgApprovalPayload from 'server/graphql/types/RejectOrgApprovalPayload';
import CancelTeamInvitePayload from 'server/graphql/types/CancelTeamInvitePayload';
import AcceptTeamInvitePayload from 'server/graphql/types/AcceptTeamInvitePayload';

const types = [
  AcceptTeamInvitePayload,
  CancelApprovalPayload,
  CancelTeamInvitePayload,
  RemoveTeamMemberPayload,
  InviteTeamMembersPayload,
  MeetingCheckInPayload,
  PromoteToTeamLeadPayload,
  RejectOrgApprovalPayload,
  RemoveOrgUserPayload,
  UpdateUserProfilePayload
];

export default graphQLSubscriptionType('TeanMemberSubscriptionPayload', types);
