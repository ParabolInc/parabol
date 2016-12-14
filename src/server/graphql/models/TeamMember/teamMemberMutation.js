import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLBoolean,
} from 'graphql';
import {errorObj} from '../utils';
import {
  requireWebsocket,
  requireSUOrTeamMember,
  requireSUOrSelfOrLead,
  requireSUOrLead,
  requireAuth
} from '../authorization';
import {parseInviteToken, validateInviteTokenKey} from '../Invitation/helpers';
import tmsSignToken from 'server/graphql/models/tmsSignToken';
import {JOIN_TEAM, KICK_OUT, PRESENCE} from 'universal/subscriptions/constants';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';

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

      // AUTH
      const userId = requireAuth(authToken);

      // VALIDATION
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

      // RESOLUTION
      const dbWork = r.table('User')
      // add the team to the user doc
        .get(userId)
        .update({
          tms: r.row('tms').append(teamId).default([teamId])
        })
        .do(() => {
          return r.table('Organization')
            .get(r.table('Team').get(teamId)('orgId'))
            .update((row) => {
              return row('members').append(userId).distinct()
            })
        })
        // get number of users
        .do(() => {
          return r.table('TeamMember')
            .getAll(teamId, {index: 'teamId'})
            .filter({isNotRemoved: true})
            .count();
        })
        // get the user
        .do((usersOnTeam) => ({
          usersOnTeam,
          user: r.table('User').get(userId)

        }))
        // insert team member
        .do((teamCountAndUser) =>
          r.table('TeamMember').insert({
            checkInOrder: teamCountAndUser('usersOnTeam').add(1),
            email: teamCountAndUser('user')('email').default(''),
            id: teamCountAndUser('user')('id').add('::', teamId),
            teamId,
            userId,
            isNotRemoved: true,
            isLead: false,
            isFacilitator: true,
            picture: teamCountAndUser('user')('picture').default(''),
            preferredName: teamCountAndUser('user')('preferredName').default(''),
          }).do(() =>
            // ...but return the user's email
            teamCountAndUser('user')('email')
          )
        )
        // find all possible emails linked to this person and mark them as accepted
        .do((userEmail) =>
          r.table('Invitation')
            .getAll(userEmail, email, {index: 'email'})
            .update({
              acceptedAt: now,
              tokenExpiration: new Date(0),
              updatedAt: now
            })
            .do(() => userEmail)
        );
      const tms = oldtms.concat(teamId);
      const asyncPromises = [
        dbWork,
        auth0ManagementClient.users.updateAppMetadata({id: userId}, {tms})
      ];
      const [userEmail] = await Promise.all(asyncPromises);
      const payload = {type: JOIN_TEAM, name: userEmail};
      exchange.publish(`${PRESENCE}/${teamId}`, payload);
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

      // AUTH
      const [userId, teamId] = teamMemberId.split('::');
      await requireSUOrSelfOrLead(authToken, userId, teamId);
      requireWebsocket(socket);

      // RESOLUTION
      const res = await r.table('TeamMember')
      // set inactive
        .get(teamMemberId)
        .update({
          isNotRemoved: false
        })
        // assign active projects to the team lead
        .do(() => {
          return r.table('Project')
            .getAll(teamMemberId, {index: 'teamMemberId'})
            .filter({isArchived: false})
            .update({
              teamMemberId: r.table('TeamMember')
                .getAll(teamId, {index: 'teamId'})
                .filter({isLead: true})
                .nth(0)('id')
            }, {nonAtomic: true});
        })
        // flag all actions as complete since the user can't edit them now, anyways
        .do(() => {
          return r.table('Action')
            .getAll(teamMemberId, {index: 'teamMemberId'})
            .update({
              isComplete: true
            });
        })
        // remove the teamId from the user tms array
        .do(() => {
          return r.table('User')
            .get(userId)
            .update((user) => {
              return user.merge({
                tms: user('tms').filter((id) => id.ne(teamId))
              });
            }, {returnChanges: true});
        });
      // update the tms on auth0
      const newtms = res.changes[0] && res.changes[0].new_val.tms;
      if (newtms) {
        await auth0ManagementClient.users.updateAppMetadata({id: userId}, {tms: newtms});
      }

      // update the server socket, if they're logged in
      const channel = `${PRESENCE}/${teamId}`;
      exchange.publish(channel, {type: KICK_OUT, userId});
      return true;
    }
  },
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
};
