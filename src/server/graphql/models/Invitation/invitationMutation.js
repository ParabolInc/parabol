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
import inviteTeamMemberSchema from 'universal/validation/inviteTeamMemberSchema';
import legitify from 'universal/validation/legitify';

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
            inviteEmails: inviteEmails,
            teamMembers: r.table('TeamMember')
              .getAll(teamId, {index: 'teamId'})
              // .filter({isNotRemoved: true})('email')
              .coerceTo('array')
          };
        });
      const schemaProps = {
        inviteEmails: usedEmails.inviteEmails,
        teamMemberEmails: usedEmails.teamMembers.filter((m) => m.isNotRemoved === true).map((m) => m.email)
      };

      const schema = inviteTeamMemberSchema(schemaProps, 'email');
      for (let i = 0; i < invitees.length; i++) {
        const invitee = invitees[i];
        const {errors} = legitify(invitee, schema);
        if (Object.keys(errors).length > 0) {
          throw errorObj(errors);
        }
      }

      // if they used to be on the team, simply reactivate them
      const inactiveTeamMembers = usedEmails.teamMembers.filter((m) => m.isNotRemoved === false);
      if (inactiveTeamMembers.length > 0) {
        const inactiveTeamMemberIds = inactiveTeamMembers.map((m) => m.id);
        await r.table('TeamMember')
          .getAll(r.args(inactiveTeamMemberIds), {index: 'id'})
          .update({isNotRemoved: true});
        const inactiveTeamMemberEmails = inactiveTeamMembers.map((m) => m.email);
        const newInvitees = invitees.filter((i) => !inactiveTeamMemberEmails.includes(i.email));
        // TODO send email & maybe pop toast saying that we're only reactivating
        asyncInviteTeam(authToken, teamId, newInvitees);
      } else {
        asyncInviteTeam(authToken, teamId, invitees);
      }
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
