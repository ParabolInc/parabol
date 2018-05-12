import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import ChangeTaskTeamPayload from 'server/graphql/types/ChangeTaskTeamPayload';
import {getUserId, isTeamMember} from 'server/utils/authorization';
import shortid from 'shortid';
import removeEntityKeepText from 'universal/utils/draftjs/removeEntityKeepText';
import {TASK, TASK_INVOLVES} from 'universal/utils/constants';
import publish from 'server/utils/publish';
import {sendTeamAccessError} from 'server/utils/authorizationErrors';
import sendAuthRaven from 'server/utils/sendAuthRaven';
import {sendTaskNotFoundError} from 'server/utils/docNotFoundErrors';

export default {
  type: ChangeTaskTeamPayload,
  description: 'Change the team a task is associated with',
  args: {
    taskId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The task to change'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The new team to assign the task to'
    }
  },
  async resolve (source, {taskId, teamId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const now = new Date();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};

    // AUTH
    const viewerId = getUserId(authToken);
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId);
    }
    const task = await r.table('Task').get(taskId);
    if (!task) {
      return sendTaskNotFoundError(authToken, taskId);
    }
    const {content, tags, teamId: oldTeamId} = task;
    if (!isTeamMember(authToken, oldTeamId)) {
      return sendTeamAccessError(authToken, oldTeamId);
    }
    if (task.userId !== viewerId) {
      const breadcrumb = {
        message: 'Cannot change team for a task assigned to someone else',
        category: 'Unauthorized access'
      };
      return sendAuthRaven(authToken, 'Oops', breadcrumb);
    }

    // RESOLUTION
    const [oldTeamMembers, newTeamMembers] = await dataLoader
      .get('teamMembersByTeamId')
      .loadMany([oldTeamId, teamId]);
    const oldTeamUserIds = oldTeamMembers.map(({userId}) => userId);
    const newTeamUserIds = newTeamMembers.map(({userId}) => userId);
    const userIdsOnlyOnOldTeam = oldTeamUserIds.filter((oldTeamUserId) => {
      return !newTeamUserIds.find((newTeamUserId) => newTeamUserId === oldTeamUserId);
    });
    const rawContent = JSON.parse(content);
    const eqFn = (entity) =>
      entity.type === 'MENTION' &&
      Boolean(userIdsOnlyOnOldTeam.find((userId) => userId === entity.data.userId));
    const {rawContent: nextRawContent, removedEntities} = removeEntityKeepText(rawContent, eqFn);

    const updates = {
      content: rawContent === nextRawContent ? undefined : JSON.stringify(nextRawContent),
      updatedAt: now,
      teamId
    };
    const {newTask} = await r({
      newTask: r
        .table('Task')
        .get(taskId)
        .update(updates),
      taskHistory: r
        .table('TaskHistory')
        .between([taskId, r.minval], [taskId, r.maxval], {
          index: 'taskIdUpdatedAt'
        })
        .orderBy({index: 'taskIdUpdatedAt'})
        .nth(-1)
        .default(null)
        .do((taskHistoryRecord) => {
          // prepopulated cards will not have a history
          return r.branch(
            taskHistoryRecord.ne(null),
            r
              .table('TaskHistory')
              .insert(taskHistoryRecord.merge(updates, {id: shortid.generate()})),
            null
          );
        })
    });

    const mentioneeUserIdsToRemove = Array.from(
      new Set(removedEntities.map(({data}) => data.userId))
    );
    const notificationsToRemove =
      mentioneeUserIdsToRemove.length === 0
        ? []
        : await r
          .table('Notification')
          .getAll(r.args(mentioneeUserIdsToRemove), {index: 'userIds'})
          .filter({
            taskId,
            type: TASK_INVOLVES
          })
          .delete({returnChanges: true})('changes')('old_val')
          .pluck('id', 'userIds')
          .default([]);

    const isPrivate = tags.includes('private');
    const data = {taskId, notificationsToRemove};
    const teamMembers = oldTeamMembers.concat(newTeamMembers);
    teamMembers.forEach(({userId}) => {
      if (!isPrivate || userId === newTask.userId) {
        publish(TASK, userId, ChangeTaskTeamPayload, data, subOptions);
      }
    });
    return data;
  }
};
