import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import CancelApprovalPayload from 'server/graphql/types/CancelApprovalPayload';
import {requireTeamMember} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {NOTIFICATION, ORG_APPROVAL, PROJECT, REQUEST_NEW_USER, TEAM_MEMBER} from 'universal/utils/constants';
import archiveProjectsForDB from 'server/safeMutations/archiveProjectsForDB';

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
    const {removedRequestNotification, softUpdates} = await r({
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
        .delete({returnChanges: true})('changes')(0)('old_val').pluck('id', 'userIds').default(null),
      softUpdates: r.table('SoftTeamMember')
        .getAll(email, {index: 'email'})
        .filter({teamId})
        .update({isActive: false}, {returnChanges: true})('changes')(0)('new_val')('id')
        .default(null)
        .do((softTeamMemberId) => {
          return r({
            softTeamMemberId,
            softProjectsToArchive: r.table('Project')
              .getAll(softTeamMemberId, {index: 'assigneeId'})
              .default([])
              .coerceTo('array')
          });
        })
    });

    const {softProjectsToArchive, softTeamMemberId} = softUpdates;
    const archivedSoftProjects = await archiveProjectsForDB(softProjectsToArchive);
    const archivedSoftProjectIds = archivedSoftProjects.map(({id}) => id);
    const data = {orgApprovalId, removedRequestNotification, softTeamMemberId, archivedSoftProjectIds};

    if (removedRequestNotification) {
      const {userIds} = removedRequestNotification;
      userIds.forEach((userId) => {
        publish(NOTIFICATION, userId, CancelApprovalPayload, data, subOptions);
      });
    }

    if (archivedSoftProjectIds.length > 0) {
      const teamMemberUserIds = await r.table('TeamMember')
        .getAll(teamId, {index: 'temId'})
        .filter({isNotRemoved: true})('userId')
        .default([]);
      teamMemberUserIds.forEach((userId) => {
        publish(PROJECT, userId, CancelApprovalPayload, data, subOptions);
      });
    }

    publish(TEAM_MEMBER, teamId, CancelApprovalPayload, data, subOptions);
    publish(ORG_APPROVAL, teamId, CancelApprovalPayload, data, subOptions);
    return data;
  }
};
