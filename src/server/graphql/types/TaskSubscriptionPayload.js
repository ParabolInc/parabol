import graphQLSubscriptionType from 'server/graphql/graphQLSubscriptionType';
import ChangeTaskTeamPayload from 'server/graphql/types/ChangeTaskTeamPayload';
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
import AcceptTeamInvitePayload from 'server/graphql/types/AcceptTeamInvitePayload';
import UpdateTaskDueDatePayload from 'server/graphql/types/UpdateTaskDueDatePayload';

const types = [
  AcceptTeamInvitePayload,
  CancelApprovalPayload,
  CancelTeamInvitePayload,
  ChangeTaskTeamPayload,
  CreateGitHubIssuePayload,
  CreateTaskPayload,
  DeleteTaskPayload,
  EditTaskPayload,
  EndMeetingPayload,
  InviteTeamMembersPayload,
  RejectOrgApprovalPayload,
  RemoveOrgUserPayload,
  RemoveTeamMemberPayload,
  UpdateTaskPayload,
  UpdateTaskDueDatePayload
];

export default graphQLSubscriptionType('TaskSubscriptionPayload', types);
