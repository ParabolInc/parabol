import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLBoolean,
} from 'graphql';
import {errorObj} from '../utils';
import {requireWebsocket, requireSUOrTeamMember, requireSUOrSelfOrLead, requireAuth} from '../authorization';
import {parseInviteToken, validateInviteTokenKey} from '../Invitation/helpers';
import tmsSignToken from 'server/graphql/models/tmsSignToken';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import {KICK_OUT} from 'universal/subscriptions/constants';

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
      // teamMemberId is of format 'userId::teamId'
      const [, teamId] = teamMemberId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);
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
    async resolve(source, {inviteToken}, {authToken}) {
      const r = getRethink();
      const userId = requireAuth(authToken);
      const now = new Date();
      const {id: inviteId, key: tokenKey} = parseInviteToken(inviteToken);

      // see if the invitation exists
      const invitation = await r.table('Invitation').get(inviteId);
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

      const dbWork = r.table('TeamMember')
      // get number of users
        .getAll(teamId, {index: 'teamId'})
        .filter({isActive: true})
        .count()
        // get the user
        .do((usersOnTeam) => ({
          usersOnTeam,
          user: r.table('User').get(userId)
        }))
        // insert team member
        .do((teamCountAndUser) =>
          r.table('TeamMember').insert({
            checkInOrder: teamCountAndUser('usersOnTeam').add(1),
            id: teamCountAndUser('user')('id').add('::', teamId),
            teamId,
            userId,
            isActive: true,
            isLead: false,
            isFacilitator: false,
            picture: teamCountAndUser('user')('picture').default(''),
            preferredName: teamCountAndUser('user')('preferredName').default(''),
          }).do(() =>
            // ...but return the user's email
            teamCountAndUser('user')('email')
          )
        )
        // find all possible emails linked to this person and mark them as accepted
        .do((userEmail) =>
          r.table('Invitation').getAll(userEmail, email, {index: 'email'}).update({
            acceptedAt: now,
            tokenExpiration: now,
            updatedAt: now
          })
        );
      const tms = oldtms.concat(teamId);
      const asyncPromises = [
        dbWork,
        auth0ManagementClient.users.updateAppMetadata({id: userId}, {tms})
      ];
      await Promise.all(asyncPromises);
      return tmsSignToken(authToken, tms);
    }
  },
  removeTeamMember: {
    type: GraphQLBoolean,
    description: 'Remove a team member from the team',
    args: {
      teamMemberId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The teamMemberId of the person who is being checked in'
      }
    },
    async resolve(source, {teamMemberId}, {authToken, exchange, socket}) {
      const r = getRethink();
      const [userId, teamId] = teamMemberId.split('::');
      await requireSUOrSelfOrLead(authToken, userId, teamId);
      requireWebsocket(socket);
      await r.table('TeamMember')
        // set inactive
        .get(teamMemberId)
        .update({
          isActive: false
        })
        // assign active projects to the team lead
        .do(() => {
          return r.table('Projects')
            .getAll(teamMemberId, {index: 'teamMemberId'})
            .filter({isArchived: false})
            .update({
              teamMemberId: r.table('TeamMember')
                .getAll(teamId, {index: 'teamId'})
                .filter({isLead: true})
                .nth(0)('id')
            })
        })
        // remove the teamId from the user tms array
        .do(() => {
          return r.table('User')
            .get(userId).update((user) => {
              return user.merge({
                tms: user('tms').without(teamId)
              })
            })
        });
      const channel = `TEAM/${teamId}`;
      exchange.publish(channel, {type: KICK_OUT, userId});


      // const authToken = socket.getAuthToken();
      // const {tms} = authToken;
      // const teamIdIdx = tms.indexOf(teamId);
      // if (teamIdIdx !== -1) {
      //   tms.splice(teamIdIdx,1);
      //   socket.setAuthToken(authToken);
      // }
      // kick out of
    }
  },
};
