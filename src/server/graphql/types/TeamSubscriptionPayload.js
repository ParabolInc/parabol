import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import AcceptTeamInviteEmailPayload from 'server/graphql/types/AcceptTeamInviteEmailPayload';
import AcceptTeamInviteNotificationPayload from 'server/graphql/types/AcceptTeamInviteNotificationPayload';
import AddTeamPayload from 'server/graphql/types/AddTeamPayload';
import ArchiveTeamPayload from 'server/graphql/types/ArchiveTeamPayload';
import EndMeetingPayload from 'server/graphql/types/EndMeetingPayload';
import InviteTeamMembersPayload from 'server/graphql/types/InviteTeamMembersPayload';
import KillMeetingPayload from 'server/graphql/types/KillMeetingPayload';
import MoveMeetingPayload from 'server/graphql/types/MoveMeetingPayload';
import PromoteFacilitatorPayload from 'server/graphql/types/PromoteFacilitatorPayload';
import RemoveTeamMemberOtherPayload from 'server/graphql/types/RemoveTeamMemberOtherPayload';
import RemoveTeamMemberSelfPayload from 'server/graphql/types/RemoveTeamMemberSelfPayload';
import RequestFacilitatorPayload from 'server/graphql/types/RequestFacilitatorPayload';


const types = [
  AcceptTeamInviteEmailPayload,
  AcceptTeamInviteNotificationPayload,
  AddTeamPayload,
  ArchiveTeamPayload,
  EndMeetingPayload,
  InviteTeamMembersPayload,
  KillMeetingPayload,
  MoveMeetingPayload,
  PromoteFacilitatorPayload,
  RequestFacilitatorPayload,
  RemoveTeamMemberOtherPayload,
  RemoveTeamMemberSelfPayload
];

export default new GraphQLSubscriptionType('TeamSubscriptionPayload', types);
