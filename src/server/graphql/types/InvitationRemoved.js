import {GraphQLObjectType} from 'graphql';
import {resolveInvitation} from 'server/graphql/resolvers';
import Invitation from 'server/graphql/types/Invitation';
import NotifyNewTeamMember from 'server/graphql/types/NotifyNewTeamMember';

const InvitationRemoved = new GraphQLObjectType({
  name: 'InvitationRemoved',
  fields: () => ({
    invitation: {
      type: Invitation,
      resolve: resolveInvitation
    },
    notification: {
      type: NotifyNewTeamMember,
      description: 'A notification annoucing that the invitee is now a team member'

    }
  })
});

export default InvitationRemoved;
