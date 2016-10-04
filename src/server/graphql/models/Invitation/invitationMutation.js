import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
} from 'graphql';
import {Invitee} from './invitationSchema';
import {requireSUOrTeamMember} from '../authorization';

import {asyncInviteTeam} from './helpers';

export default {
  inviteTeamMembers: {
    type: GraphQLBoolean,
    description: 'Send invitation emails to a list of email addresses, add them to the invitation table',
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The id of the inviting team'
      },
      invitees: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Invitee)))
      }
    },
    async resolve(source, {invitees, teamId}, {authToken}) {
      requireSUOrTeamMember(authToken, teamId);
      asyncInviteTeam(authToken, teamId, invitees);
      return true;
    }
  }
};
