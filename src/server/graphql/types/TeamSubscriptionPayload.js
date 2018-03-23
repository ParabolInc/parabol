import graphQLSubscriptionType from 'server/graphql/graphQLSubscriptionType';
import AddTeamPayload from 'server/graphql/types/AddTeamPayload';
import ArchiveTeamPayload from 'server/graphql/types/ArchiveTeamPayload';
import EndMeetingPayload from 'server/graphql/types/EndMeetingPayload';
import KillMeetingPayload from 'server/graphql/types/KillMeetingPayload';
import MoveMeetingPayload from 'server/graphql/types/MoveMeetingPayload';
import NavigateMeetingPayload from 'server/graphql/types/NavigateMeetingPayload';
import PromoteFacilitatorPayload from 'server/graphql/types/PromoteFacilitatorPayload';
import RemoveTeamMemberPayload from 'server/graphql/types/RemoveTeamMemberPayload';
import RequestFacilitatorPayload from 'server/graphql/types/RequestFacilitatorPayload';
import StartMeetingPayload from 'server/graphql/types/StartMeetingPayload';
import StartNewMeetingPayload from 'server/graphql/types/StartNewMeetingPayload';
import UpdateCheckInQuestionPayload from 'server/graphql/types/UpdateCheckInQuestionPayload';
import UpdateNewCheckInQuestionPayload from 'server/graphql/types/UpdateNewCheckInQuestionPayload';
import UpdateTeamNamePayload from 'server/graphql/types/UpdateTeamNamePayload';
import UpgradeToProPayload from 'server/graphql/types/UpgradeToProPayload';
import RemoveOrgUserPayload from 'server/graphql/types/RemoveOrgUserPayload';
import UpdateCreditCardPayload from 'server/graphql/types/UpdateCreditCardPayload';
import AcceptTeamInvitePayload from 'server/graphql/types/AcceptTeamInvitePayload';
import KillNewMeetingPayload from 'server/graphql/types/KillNewMeetingPayload';
import PromoteNewMeetingFacilitatorPayload from 'server/graphql/types/PromoteNewMeetingFacilitatorPayload';
import CreateReflectionPayload from 'server/graphql/types/CreateReflectionPayload';
import UpdateReflectionContentPayload from 'server/graphql/types/UpdateReflectionContentPayload';
import UpdateRetroReflectionIsEditingPayload from 'server/graphql/types/UpdateReflectionIsEditingPayload';
import UpdateReflectionLocationPayload from 'server/graphql/types/UpdateReflectionLocationPayload';
import RemoveReflectionPayload from 'server/graphql/types/RemoveReflectionPayload';


const types = [
  AcceptTeamInvitePayload,
  AddTeamPayload,
  ArchiveTeamPayload,
  CreateReflectionPayload,
  EndMeetingPayload,
  KillMeetingPayload,
  KillNewMeetingPayload,
  MoveMeetingPayload,
  NavigateMeetingPayload,
  PromoteFacilitatorPayload,
  PromoteNewMeetingFacilitatorPayload,
  RequestFacilitatorPayload,
  StartMeetingPayload,
  StartNewMeetingPayload,
  RemoveOrgUserPayload,
  RemoveReflectionPayload,
  RemoveTeamMemberPayload,
  UpdateCheckInQuestionPayload,
  UpdateCreditCardPayload,
  UpdateNewCheckInQuestionPayload,
  UpdateReflectionContentPayload,
  UpdateRetroReflectionIsEditingPayload,
  UpdateReflectionLocationPayload,
  UpdateTeamNamePayload,
  UpgradeToProPayload
];

export default graphQLSubscriptionType('TeamSubscriptionPayload', types);
