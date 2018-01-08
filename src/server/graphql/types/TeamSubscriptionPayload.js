import graphQLSubscriptionType from 'server/graphql/graphQLSubscriptionType';
import AcceptTeamInviteEmailPayload from 'server/graphql/types/AcceptTeamInviteEmailPayload';
import AcceptTeamInviteNotificationPayload from 'server/graphql/types/AcceptTeamInviteNotificationPayload';
import AddTeamPayload from 'server/graphql/types/AddTeamPayload';
import ArchiveTeamPayload from 'server/graphql/types/ArchiveTeamPayload';
import EndMeetingPayload from 'server/graphql/types/EndMeetingPayload';
import KillMeetingPayload from 'server/graphql/types/KillMeetingPayload';
import MoveMeetingPayload from 'server/graphql/types/MoveMeetingPayload';
import PromoteFacilitatorPayload from 'server/graphql/types/PromoteFacilitatorPayload';
import RemoveTeamMemberPayload from 'server/graphql/types/RemoveTeamMemberPayload';
import RequestFacilitatorPayload from 'server/graphql/types/RequestFacilitatorPayload';
import StartMeetingPayload from 'server/graphql/types/StartMeetingPayload';
import UpdateCheckInQuestionPayload from 'server/graphql/types/UpdateCheckInQuestionPayload';
import UpdateTeamNamePayload from 'server/graphql/types/UpdateTeamNamePayload';
import UpgradeToProPayload from 'server/graphql/types/UpgradeToProPayload';


const types = [
  AcceptTeamInviteEmailPayload,
  AcceptTeamInviteNotificationPayload,
  AddTeamPayload,
  ArchiveTeamPayload,
  EndMeetingPayload,
  KillMeetingPayload,
  MoveMeetingPayload,
  PromoteFacilitatorPayload,
  RequestFacilitatorPayload,
  StartMeetingPayload,
  RemoveTeamMemberPayload,
  UpdateCheckInQuestionPayload,
  UpdateTeamNamePayload,
  UpgradeToProPayload
];

export default graphQLSubscriptionType('TeamSubscriptionPayload', types);
