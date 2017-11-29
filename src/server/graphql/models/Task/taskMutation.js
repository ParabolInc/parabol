import { GraphQLBoolean, GraphQLID, GraphQLNonNull } from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import { requireSUOrTeamMember, requireWebsocket } from 'server/utils/authorization';
import getTypeFromEntityMap from 'universal/utils/draftjs/getTypeFromEntityMap';
import { NOTIFICATIONS_CLEARED, TASK_INVOLVES } from 'universal/utils/constants';
import getPubSub from 'server/utils/getPubSub';

export default {
  deleteTask: {
    type: GraphQLBoolean,
    description: 'Delete (not archive!) a task',
    args: {
      taskId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The taskId (teamId::shortid) to delete'
      }
    },
    async resolve(source, { taskId }, { authToken, socket }) {
      const r = getRethink();

      // AUTH
      // format of id is teamId::taskIdPart
      const [teamId] = taskId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);

      // RESOLUTION
      const { task } = await r({
        task: r.table('Task').get(taskId).delete({ returnChanges: true })('changes')(0)('old_val')
          .pluck('id', 'content', 'userId'),
        history: r.table('TaskHistory')
          .between([taskId, r.minval], [taskId, r.maxval], { index: 'taskIdUpdatedAt' })
          .delete()
      });

      const { entityMap } = JSON.parse(task.content);
      const userIdsWithNotifications = getTypeFromEntityMap('MENTION', entityMap).concat(task.userId);
      const clearedNotifications = await r.table('Notification')
        .getAll(r.args(userIdsWithNotifications), { index: 'userIds' })
        .filter({
          taskId: task.id,
          type: TASK_INVOLVES
        })
        .delete({ returnChanges: true })('changes')('old_val')
        .pluck('id', 'userIds')
        .default([]);
      clearedNotifications.forEach((notification) => {
        const notificationsCleared = { deletedIds: [notification.id] };
        const userId = notification.userIds[0];
        getPubSub().publish(`${NOTIFICATIONS_CLEARED}.${userId}`, { notificationsCleared });
      });
    }
  }
};
