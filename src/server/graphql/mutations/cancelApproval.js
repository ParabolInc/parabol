import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import CancelApprovalPayload from 'server/graphql/types/CancelApprovalPayload';
import {requireTeamMember} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {NOTIFICATION, ORG_APPROVAL, TASK, REQUEST_NEW_USER, TEAM_MEMBER} from 'universal/utils/constants';
import archiveTasksForDB from 'server/safeMutations/archiveTasksForDB';
import removeSoftTeamMember from 'server/safeMutations/removeSoftTeamMember';
import getTasksByAssigneeId from 'server/safeQueries/getTasksByAssigneeIds';
import getActiveTeamMembersByTeamIds from 'server/safeQueries/getActiveTeamMembersByTeamIds';

export default {
  type: CancelApprovalPayload,
  description: 'Cancel a pending request for an invitee to join the org',
  args: {
    orgApprovalId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'org approval id to cancel'
    }
  },
  async resolve(source, {orgApprovalId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};

    // AUTH
    const orgApprovalDoc = await r.table('OrgApproval').get(orgApprovalId);
    const {email, orgId, teamId} = orgApprovalDoc;
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    const {removedRequestNotification} = await r({
      orgApproval: r.table('OrgApproval')
        .get(orgApprovalId)
        .update({
          isActive: false
        }),
      removedRequestNotification: r.table('Notification')
        .getAll(orgId, {index: 'orgId'})
        .filter({
          type: REQUEST_NEW_USER,
          teamId,
          inviteeEmail: email
        })
        .delete({returnChanges: true})('changes')(0)('old_val').pluck('id', 'userIds').default(null)
    });

    const removedSoftTeamMember = await removeSoftTeamMember(email, teamId, dataLoader);
    const {id: softTeamMemberId} = removedSoftTeamMember;
    const softTasksToArchive = await getTasksByAssigneeId(softTeamMemberId, dataLoader);
    const archivedSoftTasks = await archiveTasksForDB(softTasksToArchive, dataLoader);
    const archivedSoftTaskIds = archivedSoftTasks.map(({id}) => id);
    const data = {orgApprovalId, removedRequestNotification, softTeamMemberId, archivedSoftTaskIds};

    if (removedRequestNotification) {
      const {userIds} = removedRequestNotification;
      userIds.forEach((userId) => {
        publish(NOTIFICATION, userId, CancelApprovalPayload, data, subOptions);
      });
    }

    if (archivedSoftTaskIds.length > 0) {
      const teamMembers = await getActiveTeamMembersByTeamIds(teamId, dataLoader);
      const userIdsOnTeams = Array.from(new Set(teamMembers.map(({userId}) => userId)));
      userIdsOnTeams.forEach((userId) => {
        publish(TASK, userId, CancelApprovalPayload, data, subOptions);
      });
    }

    publish(TEAM_MEMBER, teamId, CancelApprovalPayload, data, subOptions);
    publish(ORG_APPROVAL, teamId, CancelApprovalPayload, data, subOptions);
    return data;
  }
};
