import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import adjustUserCount from 'server/billing/helpers/adjustUserCount';
import getRethink from 'server/database/rethinkDriver';
import parseInviteToken from 'server/graphql/models/Invitation/inviteTeamMembers/parseInviteToken';
import validateInviteTokenKey from 'server/graphql/models/Invitation/inviteTeamMembers/validateInviteTokenKey';
import removeTeamMember from 'server/graphql/models/TeamMember/removeTeamMember/removeTeamMember';
import insertNewTeamMember from 'server/safeMutations/insertNewTeamMember';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import {requireAuth, requireSUOrLead, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import {ADD_USER} from 'server/utils/serverConstants';
import tmsSignToken from 'server/utils/tmsSignToken';
import {errorObj, getOldVal} from 'server/utils/utils';
import {JOIN_TEAM, PRESENCE} from 'universal/subscriptions/constants';
import addUserToTMSUserOrg from 'server/safeMutations/addUserToTMSUserOrg';
import {NOTIFICATIONS_CLEARED, TEAM_INVITE} from 'universal/utils/constants';
import getTeamInviteNotifications from 'server/safeQueries/getTeamInviteNotifications';
import getPubSub from 'server/utils/getPubSub';

export default {
  checkIn: {
    type: GraphQLBoolean,
    description: 'Check a member in as present or absent',
    args: {
      teamMemberId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The teamMemberId of the person who is being checked in'
      },
      isCheckedIn: {
        type: GraphQLBoolean,
        description: 'true if the member is present, false if absent, null if undecided'
      }
    },
    async resolve(source, {teamMemberId, isCheckedIn}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      // teamMemberId is of format 'userId::teamId'
      const [, teamId] = teamMemberId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);

      // RESOLUTION
      await r.table('TeamMember').get(teamMemberId).update({isCheckedIn});
    }
  },
  acceptInvitation: {
    type: GraphQLID,
    description: `Add a user to a Team given an invitationToken.
    If the invitationToken is valid, returns the auth token with the new team added to tms.

    Side effect: deletes all other outstanding invitations for user.`,
    args: {
      inviteToken: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The invitation token (first 6 bytes are the id, next 8 are the pre-hash)'
      }
    },
    async resolve(source, {inviteToken}, {authToken, exchange}) {
      const r = getRethink();
      const now = new Date();

      // AUTH
      const userId = requireAuth(authToken);

      // VALIDATION
      const {id: inviteId, key: tokenKey} = parseInviteToken(inviteToken);

      // see if the invitation exists
      const invitationRes = await r.table('Invitation').get(inviteId).update({
        tokenExpiration: new Date(0),
        updatedAt: now
      }, {returnChanges: true});
      const invitation = getOldVal(invitationRes);

      if (!invitation) {
        throw errorObj({
          _error: 'unable to find invitation',
          type: 'acceptInvitation',
          subtype: 'notFound'
        });
      }

      const {tokenExpiration, hashedToken, teamId, email} = invitation;
      // see if the invitation has expired
      if (tokenExpiration < now) {
        throw errorObj({
          _error: 'invitation has expired',
          type: 'acceptInvitation',
          subtype: 'expiredInvitation'
        });
      }

      // see if the invitation hash is valid
      const isCorrectToken = await validateInviteTokenKey(tokenKey, hashedToken);
      if (!isCorrectToken) {
        throw errorObj({
          _error: 'invalid invitation token',
          type: 'acceptInvitation',
          subtype: 'invalidToken'
        });
      }
      const oldtms = authToken.tms || [];
      // Check if TeamMember already exists (i.e. user invited themselves):
      const teamMemberExists = oldtms.includes(teamId);
      if (teamMemberExists) {
        throw errorObj({
          _error: 'Cannot accept invitation, already a member of team.',
          type: 'acceptInvitation',
          subtype: 'alreadyJoined'
        });
      }

      // RESOLUTION
      const {orgId, user} = await r({
        orgId: r.table('Team').get(teamId)('orgId'),
        user: r.table('User').get(userId)
      });
      const userOrgs = user.userOrgs || [];
      const userTeams = user.tms || [];
      const userInOrg = Boolean(userOrgs.find((org) => org.id === orgId));
      const tms = [...userTeams, teamId];
      const {expireInviteNotificationIds} = await r({
        // add the team to the user doc
        userUpdate: addUserToTMSUserOrg(userId, teamId, orgId),
        newTeamMember: insertNewTeamMember(userId, teamId),
        // find all possible emails linked to this person and mark them as accepted
        expireEmailInvitations: r.table('Invitation')
          .getAll(user.email, email, {index: 'email'})
          .update({
            acceptedAt: now,
            // flag the token as expired so they cannot reuse the token
            tokenExpiration: new Date(0),
            updatedAt: now
          }),
        expireInviteNotificationIds: getTeamInviteNotifications(orgId, teamId, [email])
          .delete({returnChanges: true})('changes')
          .map((change) => change('new_val')('id'))
          .default([])
      });

      if (expireInviteNotificationIds.length > 0) {
        const notificationsCleared = {deletedIds: expireInviteNotificationIds};
        getPubSub().publish(`${NOTIFICATIONS_CLEARED}.${userId}`, {notificationsCleared});
      }

      if (!userInOrg) {
        await adjustUserCount(userId, orgId, ADD_USER);
      }
      const payload = {type: JOIN_TEAM, name: user.email};
      exchange.publish(`${PRESENCE}/${teamId}`, payload);
      auth0ManagementClient.users.updateAppMetadata({id: userId}, {tms})
      return tmsSignToken(authToken, tms);
    }
  },
  removeTeamMember,
  promoteToLead: {
    type: GraphQLBoolean,
    description: 'Promote another team member to be the leader',
    args: {
      teamMemberId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'the new team member that will be the leader'
      }
    },
    async resolve(source, {teamMemberId}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      requireWebsocket(socket);
      const [, teamId] = teamMemberId.split('::');
      const myTeamMemberId = `${authToken.sub}::${teamId}`;
      await requireSUOrLead(authToken, myTeamMemberId);

      // VALIDATION
      const promoteeOnTeam = await r.table('TeamMember').get(teamMemberId);
      if (!promoteeOnTeam) {
        throw errorObj({_error: `Member ${teamMemberId} is not on the team`});
      }

      // RESOLUTION
      await r.table('TeamMember')
      // remove leadership from the caller
        .get(myTeamMemberId)
        .update({
          isLead: false
        })
        // give leadership to the new person
        .do(() => {
          return r.table('TeamMember')
            .get(teamMemberId)
            .update({
              isLead: true
            });
        });
      return true;
    }
  },
  toggleAgendaList: {
    type: GraphQLBoolean,
    description: 'Show/hide the agenda list',
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'the new team member that will be the leader'
      }
    },
    async resolve(source, {teamId}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      requireWebsocket(socket);
      const myTeamMemberId = `${authToken.sub}::${teamId}`;
      await requireSUOrTeamMember(authToken, teamId);

      // RESOLUTION
      await r.table('TeamMember')
        .get(myTeamMemberId)
        .update((teamMember) => ({
          hideAgenda: teamMember('hideAgenda').default(false).not()
        }));
      return true;
    }
  }
};
