import {GraphQLObjectType} from 'graphql';
import {makeResolveNotificationForViewer} from 'server/graphql/resolvers';
import AddOrgPayload, {addOrgFields} from 'server/graphql/types/AddOrgPayload';
import NotifyTeamInvite from 'server/graphql/types/NotifyTeamInvite';

const AddOrgInviteePayload = new GraphQLObjectType({
  name: 'AddOrgInviteePayload',
  interfaces: () => [AddOrgPayload],
  fields: () => ({
    ...addOrgFields,
    teamInviteNotification: {
      type: NotifyTeamInvite,
      description: 'The invitation sent when an org was being created',
      resolve: makeResolveNotificationForViewer('-', 'teamInviteNotifications')
    }
  })
});

export default AddOrgInviteePayload;
