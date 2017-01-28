import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
} from 'graphql';
import {Invitee} from './invitationSchema';
import {getUserId, requireSUOrTeamMember, requireWebsocket, validateNotificationId} from 'server/utils/authorization';
import {errorObj, handleSchemaErrors} from '../../../utils/utils';
import {
  asyncInviteTeam,
  makeInviteToken,
  getInviterInfoAndTeamName,
  createEmailPromises,
  resolveSentEmails,
  hashInviteTokenKey,
  resendInvite
} from './helpers';
import makeInviteTeamMembersSchema from 'universal/validation/makeInviteTeamMembersSchema';
import {INVITATION_LIFESPAN} from 'server/utils/serverConstants';

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
      },
      notificationId: {
        type: GraphQLID
      }
    },
    async resolve(source, {invitees, notificationId, teamId}, {authToken}) {
      const r = getRethink();

      // AUTH
      requireSUOrTeamMember(authToken, teamId);

      // VALIDATION
      const now = Date.now();
      // don't let them invite the same person twice
      const emails = invitees.map(invitee => invitee.email);
      const usedEmails = await r.table('Invitation')
        .getAll(r.args(emails), {index: 'email'})
        .filter(r.row('tokenExpiration').ge(r.epochTime(now)))('email')
        .coerceTo('array')
        .do((inviteEmails) => {
          return {
            inviteEmails,
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
      const schema = makeInviteTeamMembersSchema(schemaProps);
      const {errors, data: validInvitees} = schema(invitees);
      handleSchemaErrors(errors);
      const parentNotificationId = validateNotificationId(notificationId, authToken);

      // RESOLUTION
      const inactiveTeamMembers = usedEmails.teamMembers.filter((m) => m.isNotRemoved === false);
      // if they used to be on the team, simply reactivate them
      if (inactiveTeamMembers.length > 0) {
        const inactiveTeamMemberIds = inactiveTeamMembers.map((m) => m.id);
        await r.table('TeamMember')
          .getAll(r.args(inactiveTeamMemberIds), {index: 'id'})
          .update({isNotRemoved: true});
        const inactiveTeamMemberEmails = inactiveTeamMembers.map((m) => m.email);
        const newInvitees = validInvitees.filter((i) => !inactiveTeamMemberEmails.includes(i.email));
        // TODO send email & maybe pop toast saying that we're only reactivating
        asyncInviteTeam(authToken, teamId, newInvitees);
      } else {
        asyncInviteTeam(authToken, teamId, validInvitees);
      }

      if (parentNotificationId) {
        await r.table('Notification')
          .getAll(parentNotificationId, {index: 'parentId'})
          .delete()
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
    async resolve(source, {inviteId}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      const invite = await r.table('Invitation').get(inviteId);
      const {acceptedAt, teamId, tokenExpiration} = invite;
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);

      // VALIDATION
      const now = new Date();
      if (acceptedAt) {
        throw errorObj({type: 'alreadyAccepted'});
      } else if (tokenExpiration < now) {
        throw errorObj({type: 'alreadyExpired'});
      }

      // RESOLUTION
      await r.table('Invitation').get(inviteId).update({
        // set expiration to epoch so it gets removed from the changefeed
        tokenExpiration: new Date(0),
        updatedAt: now
      });
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
    async resolve(source, {inviteId}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      const invitation = await r.table('Invitation').get(inviteId);
      const {email, fullName, teamId} = invitation;
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);

      // RESOLUTION
      const inviteToken = makeInviteToken();
      const inviteeWithToken = {
        email,
        fullName,
        inviteToken
      };
      const userId = getUserId(authToken);
      const inviterInfoAndTeamName = await getInviterInfoAndTeamName(teamId, userId);
      const sendEmailPromises = createEmailPromises(inviterInfoAndTeamName, [inviteeWithToken]);
      await resolveSentEmails(sendEmailPromises, [inviteeWithToken]);
      const now = new Date();
      const hashedToken = await hashInviteTokenKey(inviteToken);
      const invitedBy = `${userId}::${teamId}`;
      const tokenExpiration = new Date(now + INVITATION_LIFESPAN);
      await r.table('Invitation').get(inviteId).update({
        hashedToken,
        invitedBy,
        inviteToken,
        inviteCount: r.row('inviteCount').add(1),
        tokenExpiration,
        updatedAt: now
      });
      await resendInvite(authToken, inviteId);
      return true;
    }
  }
};
