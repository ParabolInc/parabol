import getRethink from 'server/database/rethinkDriver';
import shortid from 'shortid';
import {ASSIGNEE, MENTIONEE, PROJECT_INVOLVES} from 'universal/utils/constants';
import getTypeFromEntityMap from 'universal/utils/draftjs/getTypeFromEntityMap';

const publishChangeNotifications = async (task, oldTask, changeUserId, usersToIgnore) => {
  const r = getRethink();
  const now = new Date();
  const changeAuthorId = `${changeUserId}::${task.teamId}`;
  const {entityMap: oldEntityMap, blocks: oldBlocks} = JSON.parse(oldTask.content);
  const {entityMap, blocks} = JSON.parse(task.content);
  const wasPrivate = oldTask.tags.includes('private');
  const isPrivate = task.tags.includes('private');
  const oldMentions = wasPrivate ? [] : getTypeFromEntityMap('MENTION', oldEntityMap);
  const mentions = isPrivate ? [] : getTypeFromEntityMap('MENTION', entityMap);
  // intersect the mentions to get the ones to add and remove
  const userIdsToRemove = oldMentions
    .filter((userId) => !mentions.includes(userId));
  const notificationsToAdd = mentions
    .filter((userId) =>
      // it didn't already exist
      !oldMentions.includes(userId) &&
      // it isn't the owner (they get the assign notification)
      userId !== task.userId &&
      // it isn't the person changing it
      changeUserId !== userId &&
      // it isn't someone in a meeting
      !usersToIgnore.includes(userId)
    )
    .map((userId) => ({
      id: shortid.generate(),
      startAt: now,
      type: PROJECT_INVOLVES,
      userIds: [userId],
      involvement: MENTIONEE,
      taskId: task.id,
      changeAuthorId,
      teamId: task.teamId
    }));

  // add in the assignee changes
  if (oldTask.assigneeId !== task.assigneeId) {
    if (task.userId !== changeUserId && !usersToIgnore.includes(task.userId)) {
      notificationsToAdd.push({
        id: shortid.generate(),
        startAt: now,
        type: PROJECT_INVOLVES,
        userIds: [task.userId],
        involvement: ASSIGNEE,
        taskId: task.id,
        changeAuthorId,
        teamId: task.teamId
      });
    }
    userIdsToRemove.push(oldTask.userId);
  }

  // if we updated the task content, push a new one with an updated task
  const oldContentLen = oldBlocks[0] ? oldBlocks[0].text.length : 0;
  if (oldContentLen < 3) {
    const contentLen = blocks[0] ? blocks[0].text.length : 0;
    if (contentLen > oldContentLen) {
      const maybeInvolvedUserIds = mentions.concat(task.userId);
      const existingTaskNotifications = await r.table('Notification')
        .getAll(r.args(maybeInvolvedUserIds), {index: 'userIds'})
        .filter({
          taskId: task.id,
          type: PROJECT_INVOLVES
        });
      notificationsToAdd.push(...existingTaskNotifications);
    }
  }

  // update changes in the db
  const {notificationsToRemove} = await r({
    notificationsToRemove: userIdsToRemove.length === 0 ? [] : r.table('Notification')
      .getAll(r.args(userIdsToRemove), {index: 'userIds'})
      .filter({
        taskId: oldTask.id,
        type: PROJECT_INVOLVES
      })
      .delete({returnChanges: true})('changes')('old_val')
      .pluck('id', 'userIds')
      .default([]),
    insertedNotifications: notificationsToAdd.length === 0 ? [] : r.table('Notification').insert(notificationsToAdd)
  });
  return {notificationsToRemove, notificationsToAdd};
};

export default publishChangeNotifications;
