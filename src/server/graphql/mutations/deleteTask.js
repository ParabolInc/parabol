import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import DeleteTaskPayload from 'server/graphql/types/DeleteTaskPayload';
import {requireTeamMember} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {NOTIFICATION, TASK, TASK_INVOLVES} from 'universal/utils/constants';
import getTypeFromEntityMap from 'universal/utils/draftjs/getTypeFromEntityMap';

export default {
  type: DeleteTaskPayload,
  description: 'Delete (not archive!) a task',
  args: {
    taskId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The taskId to delete'
    }
  },
  async resolve(source, {taskId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};

    // AUTH
    // format of id is teamId::shortId
    const [teamId] = taskId.split('::');
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    const {task, subscribedUserIds} = await r({
      task: r.table('Task').get(taskId).delete({returnChanges: true})('changes')(0)('old_val').default(null),
      taskHistory: r.table('TaskHistory')
        .between([taskId, r.minval], [taskId, r.maxval], {index: 'taskIdUpdatedAt'})
        .delete(),
      subscribedUserIds: r.table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({isNotRemoved: true})('userId')
        .coerceTo('array')
    });
    if (!task) {
      throw new Error('Task does not exist');
    }
    const {content, tags, userId: taskUserId} = task;

    // handle notifications
    const {entityMap} = JSON.parse(content);
    const userIdsWithNotifications = getTypeFromEntityMap('MENTION', entityMap).concat(taskUserId);
    const clearedNotifications = await r.table('Notification')
      .getAll(r.args(userIdsWithNotifications), {index: 'userIds'})
      .filter({
        taskId,
        type: TASK_INVOLVES
      })
      .delete({returnChanges: true})('changes')('old_val')
      .default([]);

    const data = {task, notifications: clearedNotifications};
    clearedNotifications.forEach((notification) => {
      const {userIds: [notificationUserId]} = notification;
      publish(NOTIFICATION, notificationUserId, DeleteTaskPayload, data, subOptions);
    });

    const isPrivate = tags.includes('private');
    subscribedUserIds.forEach((userId) => {
      if (!isPrivate || userId === taskUserId) {
        publish(TASK, userId, DeleteTaskPayload, data, subOptions);
      }
    });
    return data;
  }
};
