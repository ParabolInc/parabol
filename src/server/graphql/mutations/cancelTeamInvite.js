import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import CancelTeamInvitePayload from 'server/graphql/types/CancelTeamInvitePayload';
import {requireTeamMember} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {INVITATION, NOTIFICATION, TASK, TEAM_INVITE, TEAM_MEMBER} from 'universal/utils/constants';
import removeSoftTeamMember from 'server/safeMutations/removeSoftTeamMember';
import archiveTasksForDB from 'server/safeMutations/archiveTasksForDB';
import getTasksByAssigneeId from 'server/safeQueries/getTasksByAssigneeIds';
import getActiveTeamMembersByTeamIds from 'server/safeQueries/getActiveTeamMembersByTeamIds';

export default {
  name: 'CancelTeamInvite',
  type: CancelTeamInvitePayload,
  description: 'Cancel an invitation',
  args: {
    invitationId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the invitation'
    }
  },
  async resolve(source, {invitationId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const now = new Date();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};

    // AUTH
    const {email, teamId} = await r.table('Invitation').get(invitationId).default({});
    if (!teamId) {
      throw new Error('Invitation not found!');
    }
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    const {removedTeamInviteNotification} = await r({
      invitation: r.table('Invitation').get(invitationId).update({
        // set expiration to epoch
        tokenExpiration: new Date(0),
        updatedAt: now
      }),
      orgApproval: r.table('OrgApproval')
        .getAll(email, {index: 'email'})
        .filter({teamId})
        .update({
          isActive: false
        }),
      removedTeamInviteNotification: r.table('User')
        .getAll(email, {index: 'email'})
        .nth(0)('id').default(null)
        .do((userId) => {
          return r.table('Notification')
            .getAll(userId, {index: 'userIds'})
            .filter({
              type: TEAM_INVITE,
              teamId
            })
            .delete({returnChanges: true})('changes')(0)('old_val')
            .default(null);
        })
    });

    const removedSoftTeamMember = await removeSoftTeamMember(email, teamId, dataLoader);
    const {id: softTeamMemberId} = removedSoftTeamMember;
    const softTasksToArchive = await getTasksByAssigneeId(softTeamMemberId, dataLoader);
    const archivedSoftTasks = await archiveTasksForDB(softTasksToArchive, dataLoader);
    const archivedSoftTaskIds = archivedSoftTasks.map(({id}) => id);
    const data = {invitationId, removedTeamInviteNotification, archivedSoftTaskIds, softTeamMemberId};

    if (archivedSoftTaskIds.length > 0) {
      const teamMembers = await getActiveTeamMembersByTeamIds(teamId, dataLoader);
      const userIdsOnTeams = Array.from(new Set(teamMembers.map(({userId}) => userId)));
      userIdsOnTeams.forEach((userId) => {
        publish(TASK, userId, CancelTeamInvitePayload, data, subOptions);
      });
    }

    publish(TEAM_MEMBER, teamId, CancelTeamInvitePayload, data, subOptions);
    publish(INVITATION, teamId, CancelTeamInvitePayload, data, subOptions);
    if (removedTeamInviteNotification) {
      const {userIds: [userId]} = removedTeamInviteNotification;
      publish(NOTIFICATION, userId, CancelTeamInvitePayload, data, subOptions);
    }
    return data;
  }
};
