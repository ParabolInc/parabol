import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import AcceptTeamInviteEmailPayload from 'server/graphql/types/AcceptTeamInviteEmailPayload';
import AcceptTeamInviteNotificationPayload from 'server/graphql/types/AcceptTeamInviteNotificationPayload';
import InviteTeamMembersAnnouncePayload from 'server/graphql/types/InviteTeamMembersAnnoucePayload';
import MeetingCheckInPayload from 'server/graphql/types/MeetingCheckInPayload';
import PromoteToTeamLeadPayload from 'server/graphql/types/PromoteToTeamLeadPayload';
import RemoveTeamMemberSelfPayload from 'server/graphql/types/RemoveTeamMemberExMemberPayload';
import RemoveTeamMemberOtherPayload from 'server/graphql/types/RemoveTeamMemberOtherPayload';

const types = [
  AcceptTeamInviteNotificationPayload,
  AcceptTeamInviteEmailPayload,
  RemoveTeamMemberOtherPayload,
  RemoveTeamMemberSelfPayload,
  InviteTeamMembersAnnouncePayload,
  MeetingCheckInPayload,
  PromoteToTeamLeadPayload
];

export default new GraphQLSubscriptionType('TeanMemberSubscriptionPayload', types);
