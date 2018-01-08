import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import AcceptTeamInviteEmailPayload from 'server/graphql/types/AcceptTeamInviteEmailPayload';
import AcceptTeamInviteNotificationPayload from 'server/graphql/types/AcceptTeamInviteNotificationPayload';
import InviteTeamMembersPayload from 'server/graphql/types/InviteTeamMembersPayload';
import MeetingCheckInPayload from 'server/graphql/types/MeetingCheckInPayload';
import PromoteToTeamLeadPayload from 'server/graphql/types/PromoteToTeamLeadPayload';
import RemoveTeamMemberPayload from 'server/graphql/types/RemoveTeamMemberPayload';

const types = [
  AcceptTeamInviteNotificationPayload,
  AcceptTeamInviteEmailPayload,
  RemoveTeamMemberPayload,
  InviteTeamMembersPayload,
  MeetingCheckInPayload,
  PromoteToTeamLeadPayload
];

export default new GraphQLSubscriptionType('TeanMemberSubscriptionPayload', types);
