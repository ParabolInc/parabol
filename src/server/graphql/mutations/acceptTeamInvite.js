import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import parseInviteToken from 'server/graphql/mutations/helpers/inviteTeamMembers/parseInviteToken';
import validateInviteTokenKey from 'server/graphql/mutations/helpers/inviteTeamMembers/validateInviteTokenKey';
import AcceptTeamInvitePayload from 'server/graphql/types/AcceptTeamInvitePayload';
import acceptTeamInvite from 'server/safeMutations/acceptTeamInvite';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import {getUserId, isAuthenticated} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import tmsSignToken from 'server/utils/tmsSignToken';
import {INVITATION, NEW_AUTH_TOKEN, TASK, TEAM, TEAM_MEMBER, UPDATED} from 'universal/utils/constants';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';
import getActiveTeamMembersByTeamIds from 'server/safeQueries/getActiveTeamMembersByTeamIds';
import {
  sendInvitationExpiredError,
  sendInvitationHashFailError,
  sendNotAuthenticatedAccessError,
  sendTeamAlreadyJoinedError
} from 'server/utils/authorizationErrors';
import {
  sendInvitationNotFoundError, sendNoInvitationProvidedError,
  sendNotificationAccessError
} from 'server/utils/docNotFoundErrors';


const validateInviteToken = async (inviteToken, authToken) => {
  const r = getRethink();
  const now = new Date();
  const {id: inviteId, key: tokenKey} = parseInviteToken(inviteToken);

  // see if the invitation exists
  const invitation = await r.table('Invitation').get(inviteId).update({
    tokenExpiration: new Date(0),
    updatedAt: now
  }, {returnChanges: true})('changes')(0)('old_val').default(null);

  if (!invitation) {
    return sendInvitationNotFoundError(authToken, inviteToken);
  }

  const {tokenExpiration, hashedToken, teamId} = invitation;
  // see if the invitation has expired
  if (tokenExpiration < now) {
    return sendInvitationExpiredError(authToken, inviteToken);
  }

  // see if the invitation hash is valid
  const isCorrectToken = await validateInviteTokenKey(tokenKey, hashedToken);
  if (!isCorrectToken) {
    return sendInvitationHashFailError(authToken, inviteToken);
  }
  const oldtms = authToken.tms || [];
  // Check if TeamMember already exists (i.e. user invited themselves):
  const teamMemberExists = oldtms.includes(teamId);
  if (teamMemberExists) {
    return sendTeamAlreadyJoinedError(authToken, inviteToken);
  }
  return invitation;
};

export default {
  type: new GraphQLNonNull(AcceptTeamInvitePayload),
  description: `Add a user to a Team given an invitationToken or the notification id of the invitation.
    If the invitationToken is valid, returns the auth token with the new team added to tms.
    Side effect: deletes all other outstanding invitations for user.`,
  args: {
    inviteToken: {
      type: GraphQLID,
      description: 'The invitation token (first 6 bytes are the id, next 8 are the pre-hash)'
    },
    notificationId: {
      type: GraphQLID,
      description: 'The notification id of the team invite'
    }
  },
  async resolve(source, {inviteToken, notificationId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};

    // AUTH
    const viewerId = getUserId(authToken);
    if (!isAuthenticated(authToken)) return sendNotAuthenticatedAccessError();

    // VALIDATION
    let inviteeEmail;
    let teamId;
    if (inviteToken) {
      const errorOrInvitation = await validateInviteToken(inviteToken);
      if (errorOrInvitation.error) return errorOrInvitation;
      inviteeEmail = errorOrInvitation.email;
      teamId = errorOrInvitation.teamId;
    } else if (notificationId) {
      const notification = await r.table('Notification').get(notificationId);
      if (!notification || !notification.userIds.includes(viewerId)) return sendNotificationAccessError(authToken, notificationId);
      inviteeEmail = notification.inviteeEmail;
      teamId = notification.teamId;
    } else {
      return sendNoInvitationProvidedError(authToken);
    }

    // RESOLUTION
    const {
      hardenedTasks,
      removedNotification,
      removedInvitationId: invitationId,
      removedSoftTeamMember
    } = await acceptTeamInvite(teamId, authToken, inviteeEmail);
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
      taskIds: hardenedTasks.map(({id}) => id)
    };

    if (hardenedTasks.length > 0) {
      const teamMembers = await getActiveTeamMembersByTeamIds(teamId, dataLoader);
      teamMembers.forEach(({userId}) => {
        publish(TASK, userId, AcceptTeamInvitePayload, data, subOptions);
      });
    }
    // Send the new team member a welcome & a new token
    publish(NEW_AUTH_TOKEN, viewerId, UPDATED, {tms});
    auth0ManagementClient.users.updateAppMetadata({id: viewerId}, {tms});

    // remove the old invitation
    publish(INVITATION, teamId, AcceptTeamInvitePayload, data, subOptions);

    // Tell the new team member about the team, welcome them, and remove their outstanding invitation notifications
    publish(TEAM, viewerId, AcceptTeamInvitePayload, data, subOptions);

    // Tell the rest of the team about the new team member, toast the event, and remove their old invitations
    publish(TEAM_MEMBER, teamId, AcceptTeamInvitePayload, data, subOptions);

    return {...data, authToken: newAuthToken};
  }
};

