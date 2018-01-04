import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import AcceptTeamInviteEmailPayload from 'server/graphql/types/AcceptTeamInviteEmailPayload';
import AcceptTeamInviteNotificationPayload from 'server/graphql/types/AcceptTeamInviteNotificationPayload';
import AddTeamPayload from 'server/graphql/types/AddTeamPayload';
import ArchiveTeamPayload from 'server/graphql/types/ArchiveTeamPayload';
import RemoveTeamMemberOtherPayload from 'server/graphql/types/RemoveTeamMemberOtherPayload';
import RemoveTeamMemberSelfPayload from 'server/graphql/types/RemoveTeamMemberSelfPayload';


const types = [
  AcceptTeamInviteEmailPayload,
  AcceptTeamInviteNotificationPayload,
  RemoveTeamMemberOtherPayload,
  RemoveTeamMemberSelfPayload,
  AddTeamPayload,
  ArchiveTeamPayload
];

export default new GraphQLSubscriptionType('TeamSubscriptionPayload', types);
