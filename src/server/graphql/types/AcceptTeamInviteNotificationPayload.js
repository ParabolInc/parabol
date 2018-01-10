import {GraphQLObjectType} from 'graphql';
import AcceptTeamInvitePayload, {acceptTeamInviteFields} from 'server/graphql/types/AcceptTeamInvitePayload';


const AcceptTeamInviteNotificationPayload = new GraphQLObjectType({
  name: 'AcceptTeamInviteNotificationPayload',
  interfaces: () => [AcceptTeamInvitePayload],
  fields: () => acceptTeamInviteFields
});

export default AcceptTeamInviteNotificationPayload;
