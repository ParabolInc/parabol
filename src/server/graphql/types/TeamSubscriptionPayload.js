import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import AcceptTeamInviteEmailPayload from 'server/graphql/types/AcceptTeamInviteEmailPayload';
import AcceptTeamInviteNotificationPayload from 'server/graphql/types/AcceptTeamInviteNotificationPayload';
import AddTeamPayload from 'server/graphql/types/AddTeamPayload';
import ArchiveTeamPayload from 'server/graphql/types/ArchiveTeamPayload';
import EndMeetingPayload from 'server/graphql/types/EndMeetingPayload';
import InviteTeamMembersPayload from 'server/graphql/types/InviteTeamMembersPayload';
import RemoveTeamMemberOtherPayload from 'server/graphql/types/RemoveTeamMemberOtherPayload';
import RemoveTeamMemberSelfPayload from 'server/graphql/types/RemoveTeamMemberSelfPayload';


const types = [
  AcceptTeamInviteEmailPayload,
  AcceptTeamInviteNotificationPayload,
  AddTeamPayload,
  ArchiveTeamPayload,
  EndMeetingPayload,
  InviteTeamMembersPayload,
  RemoveTeamMemberOtherPayload,
  RemoveTeamMemberSelfPayload
];

export default new GraphQLSubscriptionType('TeamSubscriptionPayload', types);
