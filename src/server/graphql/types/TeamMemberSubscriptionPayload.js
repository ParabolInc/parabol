import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import AcceptTeamInviteEmailPayload from 'server/graphql/types/AcceptTeamInviteEmailPayload';
import AcceptTeamInviteNotificationPayload from 'server/graphql/types/AcceptTeamInviteNotificationPayload';
import RemoveTeamMemberOtherPayload from 'server/graphql/types/RemoveTeamMemberOtherPayload';
import RemoveTeamMemberSelfPayload from 'server/graphql/types/RemoveTeamMemberSelfPayload';

const types = [
  RemoveTeamMemberOtherPayload,
  RemoveTeamMemberSelfPayload,
  AcceptTeamInviteNotificationPayload,
  AcceptTeamInviteEmailPayload
];

export default new GraphQLSubscriptionType('TeanMemberSubscriptionPayload', types);
