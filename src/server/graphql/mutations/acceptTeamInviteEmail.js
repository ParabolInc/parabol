import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import parseInviteToken from 'server/graphql/mutations/helpers/inviteTeamMembers/parseInviteToken';
import validateInviteTokenKey from 'server/graphql/mutations/helpers/inviteTeamMembers/validateInviteTokenKey';
import AcceptTeamInviteEmailPayload from 'server/graphql/types/AcceptTeamInviteEmailPayload';
import acceptTeamInvite from 'server/safeMutations/acceptTeamInvite';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import {getUserId} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import tmsSignToken from 'server/utils/tmsSignToken';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {NEW_AUTH_TOKEN, PROJECT, TEAM, TEAM_MEMBER, UPDATED} from 'universal/utils/constants';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

export default {
  type: new GraphQLNonNull(AcceptTeamInviteEmailPayload),
  description: `Add a user to a Team given an invitationToken.
    If the invitationToken is valid, returns the auth token with the new team added to tms.
    Side effect: deletes all other outstanding invitations for user.`,
  args: {
    inviteToken: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The invitation token (first 6 bytes are the id, next 8 are the pre-hash)'
    }
  },
  async resolve(source, {inviteToken}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const now = new Date();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};

    // AUTH
    requireAuth(authToken);

    // VALIDATION
    const {id: inviteId, key: tokenKey} = parseInviteToken(inviteToken);

    // see if the invitation exists
    const invitation = await r.table('Invitation').get(inviteId).update({
      tokenExpiration: new Date(0),
      updatedAt: now
    }, {returnChanges: true})('changes')(0)('old_val').default(null);

    if (!invitation) {
      return {
        error: {
          title: 'Invitation not found, but don’t worry',
          message: `
              Hey we couldn’t find that invitation. If you’d like to
              create your own team, you can start that process here.
            `
        }
      };
    }

    const {tokenExpiration, hashedToken, teamId, email} = invitation;
    // see if the invitation has expired
    if (tokenExpiration < now) {
      return {
        error: {
          title: 'Invitation has expired',
          message: `
              Hey, your invitation expired. Maybe someone already used it or
              it was sitting in your inbox too long.
              Ask your friend for a new one.
            `
        }
      };
    }

    // see if the invitation hash is valid
    const isCorrectToken = await validateInviteTokenKey(tokenKey, hashedToken);
    if (!isCorrectToken) {
      return {
        error: {
          title: 'Invitation invalid',
          message: `
              We had difficulty with that link. Did you paste it correctly?
            `
        }
      };
    }
    const oldtms = authToken.tms || [];
    // Check if TeamMember already exists (i.e. user invited themselves):
    const teamMemberExists = oldtms.includes(teamId);
    if (teamMemberExists) {
      return {
        error: {
          title: 'Team already joined',
          message: `
              Hey, we think you already belong to this team.
            `
        }
      };
    }

    // RESOLUTION
    const viewerId = getUserId(authToken);
    const {
      hardenedProjects,
      removedNotification,
      removedInvitationId: invitationId,
      removedSoftTeamMember
    } = await acceptTeamInvite(teamId, authToken, email);
    const oldTMS = authToken.tms || [];
    const tms = oldTMS.concat(teamId);
    const teamMemberId = toTeamMemberId(teamId, viewerId);
    const newAuthToken = tmsSignToken(authToken, tms);

    const data = {
      userId: viewerId,
      teamId,
      teamMemberId,
      removedNotification,
      invitationId,
      softTeamMemberId: removedSoftTeamMember.id,
      projectIds: hardenedProjects.map(({id}) => id)
    };

    if (hardenedProjects.length > 0) {
      const userIdsForTeam = await r.table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({isNotRemoved: true})('userId')
        .default([]);
      userIdsForTeam.forEach((userId) => {
        publish(PROJECT, userId, AcceptTeamInviteEmailPayload, data, subOptions);
      });
    }
    // Send the new team member a welcome & a new token
    publish(NEW_AUTH_TOKEN, viewerId, UPDATED, {tms});
    auth0ManagementClient.users.updateAppMetadata({id: viewerId}, {tms});

    // Tell the new team member about the team, welcome them, and remove their outstanding invitation notifications
    publish(TEAM, viewerId, AcceptTeamInviteEmailPayload, data, subOptions);

    // Tell the rest of the team about the new team member, toast the event, and remove their old invitations
    publish(TEAM_MEMBER, teamId, AcceptTeamInviteEmailPayload, data, subOptions);

    return {...data, authToken: newAuthToken};
  }
};

