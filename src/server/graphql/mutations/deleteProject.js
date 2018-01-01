import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import DeleteProjectPayload from 'server/graphql/types/DeleteProjectPayload';
import {requireTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {NOTIFICATIONS_CLEARED, PROJECT, PROJECT_INVOLVES, REMOVED} from 'universal/utils/constants';
import getTypeFromEntityMap from 'universal/utils/draftjs/getTypeFromEntityMap';

export default {
  type: DeleteProjectPayload,
  description: 'Delete (not archive!) a project',
  args: {
    projectId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The projectId to delete'
    }
  },
  async resolve(source, {projectId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};
    // AUTH
    // format of id is teamId::shortId
    const [teamId] = projectId.split('::');
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    const {project} = await r({
      project: r.table('Project').get(projectId).delete({returnChanges: true})('changes')(0)('old_val').default(null),
      projectHistory: r.table('ProjectHistory')
        .between([projectId, r.minval], [projectId, r.maxval], {index: 'projectIdUpdatedAt'})
        .delete()
    });
    if (!project) {
      throw new Error('Project does not exist');
    }
    const {content, tags, userId} = project;
    const wasPrivate = tags.includes('private');
    const data = {type: REMOVED, projectId, isPrivate: wasPrivate, wasPrivate, userId};
    getPubSub().publish(`${PROJECT}.${teamId}`, {data, ...subOptions});

    // handle notifications
    const {entityMap} = JSON.parse(content);
    const userIdsWithNotifications = getTypeFromEntityMap('MENTION', entityMap).concat(userId);
    const clearedNotifications = await r.table('Notification')
      .getAll(r.args(userIdsWithNotifications), {index: 'userIds'})
      .filter({
        projectId,
        type: PROJECT_INVOLVES
      })
      .delete({returnChanges: true})('changes')('old_val')
      .pluck('id', 'userIds')
      .default([]);
    clearedNotifications.forEach((notification) => {
      const notificationsCleared = {deletedIds: [notification.id]};
      const notificationUserId = notification.userIds[0];
      getPubSub().publish(`${NOTIFICATIONS_CLEARED}.${notificationUserId}`, {notificationsCleared});
    });

    return {project};
  }
};
