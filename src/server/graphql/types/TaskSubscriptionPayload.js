import graphQLSubscriptionType from 'server/graphql/graphQLSubscriptionType';
import CreateGitHubIssuePayload from 'server/graphql/types/CreateGitHubIssuePayload';
import CreateTaskPayload from 'server/graphql/types/CreateTaskPayload';
import DeleteTaskPayload from 'server/graphql/types/DeleteTaskPayload';
import EditTaskPayload from 'server/graphql/types/EditTaskPayload';
import EndMeetingPayload from 'server/graphql/types/EndMeetingPayload';
import UpdateTaskPayload from 'server/graphql/types/UpdateTaskPayload';
import RemoveTeamMemberPayload from 'server/graphql/types/RemoveTeamMemberPayload';
import RemoveOrgUserPayload from 'server/graphql/types/RemoveOrgUserPayload';
import CancelApprovalPayload from 'server/graphql/types/CancelApprovalPayload';
import RejectOrgApprovalPayload from 'server/graphql/types/RejectOrgApprovalPayload';
import CancelTeamInvitePayload from 'server/graphql/types/CancelTeamInvitePayload';
import InviteTeamMembersPayload from 'server/graphql/types/InviteTeamMembersPayload';
import AcceptTeamInviteEmailPayload from 'server/graphql/types/AcceptTeamInviteEmailPayload';
import AcceptTeamInviteNotificationPayload from 'server/graphql/types/AcceptTeamInviteNotificationPayload';

const types = [
  AcceptTeamInviteEmailPayload,
  AcceptTeamInviteNotificationPayload,
  CancelApprovalPayload,
  CancelTeamInvitePayload,
  CreateGitHubIssuePayload,
  CreateTaskPayload,
  DeleteTaskPayload,
  EditTaskPayload,
  EndMeetingPayload,
  InviteTeamMembersPayload,
  RejectOrgApprovalPayload,
  RemoveOrgUserPayload,
  RemoveTeamMemberPayload,
  UpdateTaskPayload
];

export default graphQLSubscriptionType('TaskSubscriptionPayload', types);

