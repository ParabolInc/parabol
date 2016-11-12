import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
} from 'graphql';
import {Invitee} from './invitationSchema';
import {requireSUOrTeamMember} from '../authorization';
import {errorObj} from '../utils';

import {asyncInviteTeam, cancelInvitation, resendInvite} from './helpers';

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
      const r = getRethink();
      requireSUOrTeamMember(authToken, teamId);
      const now = Date.now();
      // don't let them invite the same person twice
      const emails = invitees.map(invitee => invitee.email);
      const usedEmails = await r.table('Invitation')
        .getAll(r.args(emails), {index: 'email'})
        .filter(r.row('tokenExpiration').ge(r.epochTime(now)))('email')
        .coerceTo('array')
        .do((inviteEmails) => {
          return {
            invites: inviteEmails,
            teamMembers: r.table('TeamMember')
              .getAll(teamId, {index: 'teamId'})('email')
              .coerceTo('array')
          };
        });
      const alreadyInvited = invitees
        .map((i) => i.email)
        .filter((email) => usedEmails.invites.includes(email))
        .join(', ');
      if (alreadyInvited) {
        throw errorObj({
          _error: `${alreadyInvited.join(', ')} already invited`,
          type: 'alreadyInvited'
        });
      }
      const alreadyTeamMember = invitees
        .map((i) => i.email)
        .filter((email) => usedEmails.teamMembers.includes(email))
        .join(', ');
      if (alreadyTeamMember) {
        throw errorObj({
          _error: `${alreadyTeamMember.join(', ')} already on the team`,
          type: 'alreadyTeamMember'
        });
      }
      asyncInviteTeam(authToken, teamId, invitees);
      return true;
    }
  },
  cancelInvite: {
    type: GraphQLBoolean,
    description: 'Cancel an invitation',
    args: {
      inviteId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The id of the invitation'
      },
    },
    async resolve(source, {inviteId}, {authToken}) {
      await cancelInvitation(authToken, inviteId);
      return true;
    }
  },
  resendInvite: {
    type: GraphQLBoolean,
    description: 'Cancel an invitation',
    args: {
      inviteId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The id of the invitation'
      },
    },
    async resolve(source, {inviteId}, {authToken}) {
      await resendInvite(authToken, inviteId);
      return true;
    }
  }
};
