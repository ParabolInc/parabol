import {GraphQLObjectType} from 'graphql';
import {makeResolveNotificationForViewer} from 'server/graphql/resolvers';
import AddTeamPayload, {addTeamFields} from 'server/graphql/types/AddTeamPayload';
import NotifyTeamInvite from 'server/graphql/types/NotifyTeamInvite';

const AddTeamInviteePayload = new GraphQLObjectType({
  name: 'AddTeamInviteePayload',
  interfaces: () => [AddTeamPayload],
  fields: () => ({
    ...addTeamFields,
    teamInviteNotification: {
      type: NotifyTeamInvite,
      description: 'The invitation sent when an org was being created',
      resolve: makeResolveNotificationForViewer('-', 'teamInviteNotifications')
    }
  })
});

export default AddTeamInviteePayload;
