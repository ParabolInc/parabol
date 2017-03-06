import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLBoolean,
} from 'graphql';
import {errorObj, getOldVal} from 'server/utils/utils';
import {
  requireWebsocket,
  requireSUOrTeamMember,
  requireSUOrLead,
  requireAuth
} from 'server/utils/authorization';
import parseInviteToken from 'server/graphql/models/Invitation/inviteTeamMembers/parseInviteToken';
import validateInviteTokenKey from 'server/graphql/models/Invitation/inviteTeamMembers/validateInviteTokenKey';
import tmsSignToken from 'server/utils/tmsSignToken';
import {JOIN_TEAM, PRESENCE} from 'universal/subscriptions/constants';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import {
  ADD_USER,
} from 'server/utils/serverConstants';
import adjustUserCount from 'server/billing/helpers/adjustUserCount';
import removeTeamMember from 'server/graphql/models/TeamMember/removeTeamMember/removeTeamMember';

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
      const {orgId, user} = await r.expr({
        orgId: r.table('Team').get(teamId)('orgId'),
        user: r.table('User').get(userId)
      });
      const userOrgs = user.userOrgs || [];
      const userTeams = user.tms || [];
      const userInOrg = Boolean(userOrgs.find((org) => org.id === orgId));
      const tms = [...userTeams, teamId];
      const teamMemberId = `${user.id}::${teamId}`;
      const dbWork = r.table('User')
      // add the team to the user doc
        .get(userId)
        .update((userDoc) => {
          return {
            tms: userDoc('tms')
              .default([])
              .append(teamId)
              .distinct(),
          };
        })
        // get number of users
        .do(() => {
          return r.table('TeamMember')
            .getAll(teamId, {index: 'teamId'})
            .filter({isNotRemoved: true})
            .count();
        })
        // insert team member
      .do((teamCount) =>
          r.table('TeamMember').insert({
            id: teamMemberId,
            checkInOrder: teamCount.add(1),
            email: user.email,
            teamId,
            userId,
            isCheckedIn: null,
            isNotRemoved: true,
            isLead: false,
            isFacilitator: true,
            picture: user.picture,
            preferredName: user.preferredName,
          // conflict is possible if person was removed from the team + org & then rejoined (isNotRemoved would be false)
          }, {conflict: 'update'})
        )
        // find all possible emails linked to this person and mark them as accepted
        .do(() =>
          r.table('Invitation')
            .getAll(user.email, email, {index: 'email'})
            .update({
              acceptedAt: now,
              // flag the token as expired so they cannot reuse the token
              tokenExpiration: new Date(0),
              updatedAt: now
            })
        );
      const asyncPromises = [
        dbWork,
        auth0ManagementClient.users.updateAppMetadata({id: userId}, {tms})
      ];
      await Promise.all(asyncPromises);

      if (!userInOrg) {
        await adjustUserCount(userId, orgId, ADD_USER);
      }
      const payload = {type: JOIN_TEAM, name: user.email};
      exchange.publish(`${PRESENCE}/${teamId}`, payload);
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
    async
    resolve(source, {teamMemberId}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      requireWebsocket(socket);
      const [, teamId] = teamMemberId.split('::');
      const myTeamMemberId = `${authToken.sub}::${teamId}`;
      await
        requireSUOrLead(authToken, myTeamMemberId);

      // VALIDATION
      const promoteeOnTeam = await
        r.table('TeamMember').get(teamMemberId);
      if (!promoteeOnTeam) {
        throw errorObj({_error: `Member ${teamMemberId} is not on the team`});
      }

      // RESOLUTION
      await
        r.table('TeamMember')
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
};
