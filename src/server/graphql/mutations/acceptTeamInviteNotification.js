import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import AcceptTeamInviteNotificationPayload from 'server/graphql/types/AcceptTeamInviteNotificationPayload';
import acceptTeamInvite from 'server/safeMutations/acceptTeamInvite';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import {getUserId, requireNotificationOwner} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {INVITATION, NEW_AUTH_TOKEN, PROJECT, TEAM, TEAM_MEMBER, UPDATED} from 'universal/utils/constants';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';
import getActiveTeamMembersByTeamIds from 'server/safeQueries/getActiveTeamMembersByTeamIds';
import AcceptTeamInviteEmailPayload from 'server/graphql/types/AcceptTeamInviteEmailPayload';

export default {
  type: AcceptTeamInviteNotificationPayload,
  description: 'Approve an outsider to join the organization',
  args: {
    notificationId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The notification id of the team invite'
    }
  },
  async resolve(source, {notificationId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};

    // AUTH
    const viewerId = getUserId(authToken);
    const notification = await r.table('Notification').get(notificationId);
    requireNotificationOwner(viewerId, notification);

    // RESOLUTION
    const {inviteeEmail, teamId} = notification;
    const {
      hardenedTasks,
      removedNotification,
      removedInvitationId: invitationId,
      removedSoftTeamMember
    } = await acceptTeamInvite(teamId, authToken, inviteeEmail);
    const teamMemberId = toTeamMemberId(teamId, viewerId);
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
        publish(PROJECT, userId, AcceptTeamInviteEmailPayload, data, subOptions);
      });
    }

    // Send the new team member a welcome & a new token
    const tms = authToken.tms.concat(teamId);
    publish(NEW_AUTH_TOKEN, viewerId, UPDATED, {tms});
    auth0ManagementClient.users.updateAppMetadata({id: viewerId}, {tms});

    // remove the old invitation
    publish(INVITATION, teamId, AcceptTeamInviteNotificationPayload, data, subOptions);

    // Tell the new team member about the team, welcome them, and remove their outstanding invitation notifications
    publish(TEAM, viewerId, AcceptTeamInviteNotificationPayload, data, subOptions);

    // Tell the rest of the team about the new team member, toast the event
    publish(TEAM_MEMBER, teamId, AcceptTeamInviteNotificationPayload, data, subOptions);

    return data;
  }
};

