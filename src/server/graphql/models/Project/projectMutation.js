import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import getTypeFromEntityMap from 'universal/utils/draftjs/getTypeFromEntityMap';
import {NOTIFICATIONS_CLEARED, PROJECT_INVOLVES} from 'universal/utils/constants';
import getPubSub from 'server/utils/getPubSub';

export default {
  deleteProject: {
    type: GraphQLBoolean,
    description: 'Delete (not archive!) a project',
    args: {
      projectId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The projectId (teamId::shortid) to delete'
      }
    },
    async resolve(source, {projectId}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      // format of id is teamId::taskIdPart
      const [teamId] = projectId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);

      // RESOLUTION
      const {project} = await r({
        project: r.table('Project').get(projectId).delete({returnChanges: true})('changes')(0)('old_val')
          .pluck('id', 'content', 'userId'),
        history: r.table('ProjectHistory')
          .between([projectId, r.minval], [projectId, r.maxval], {index: 'projectIdUpdatedAt'})
          .delete()
      });

      const {entityMap} = JSON.parse(project.content);
      const userIdsWithNotifications = getTypeFromEntityMap('MENTION', entityMap).concat(project.userId);
      const clearedNotifications = await r.table('Notification')
        .getAll(r.args(userIdsWithNotifications), {index: 'userIds'})
        .filter({
          projectId: project.id,
          type: PROJECT_INVOLVES
        })
        .delete({returnChanges: true})('changes')('old_val')
        .pluck('id', 'userIds')
        .default([]);
      clearedNotifications.forEach((notification) => {
        const notificationsCleared = {deletedIds: [notification.id]};
        const userId = notification.userIds[0];
        getPubSub().publish(`${NOTIFICATIONS_CLEARED}.${userId}`, {notificationsCleared});
      });
    }
  }
};
