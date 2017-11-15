import getRethink from 'server/database/rethinkDriver';
import getPubSub from 'server/utils/getPubSub';
import shortid from 'shortid';
import {
  ASSIGNEE,
  MENTIONEE,
  NOTIFICATIONS_ADDED,
  NOTIFICATIONS_CLEARED,
  PROJECT_INVOLVES
} from 'universal/utils/constants';
import getTypeFromEntityMap from 'universal/utils/draftjs/getTypeFromEntityMap';

const publishChangeNotifications = async (project, oldProject, changeUserId, usersToIgnore) => {
  const r = getRethink();
  const now = new Date();
  const changeAuthorId = `${changeUserId}::${project.teamId}`;
  const {entityMap: oldEntityMap, blocks: oldBlocks} = JSON.parse(oldProject.content);
  const {entityMap, blocks} = JSON.parse(project.content);
  const oldMentions = getTypeFromEntityMap('MENTION', oldEntityMap);
  const mentions = getTypeFromEntityMap('MENTION', entityMap);
  // intersect the mentions to get the ones to add and remove
  const notificationsToRemove = oldMentions
    .filter((userId) => !mentions.includes(userId));
  const notificationsToAdd = mentions
    // it didn't already exist
    .filter((userId) => !oldMentions.includes(userId) &&
      // it isn't the owner (they get the assign notification)
      userId !== project.userId &&
      // it isn't the person changing it
      changeUserId !== userId &&
      // it isn't someone in a meeting
      !usersToIgnore.includes(project.userId))
    .map((userId) => ({
      id: shortid.generate(),
      startAt: now,
      type: PROJECT_INVOLVES,
      userIds: [userId],
      involvement: MENTIONEE,
      projectId: project.id,
      changeAuthorId,
      teamId: project.teamId
    }));

  // add in the assignee changes
  if (oldProject.teamMemberId !== project.teamMemberId) {
    if (project.userId !== changeUserId) {
      notificationsToAdd.push({
        id: shortid.generate(),
        startAt: now,
        type: PROJECT_INVOLVES,
        userIds: [project.userId],
        involvement: ASSIGNEE,
        projectId: project.id,
        changeAuthorId,
        teamId: project.teamId
      });
    }
    notificationsToRemove.push(oldProject.userId);
  }

  // if we updated the project content, push a new one with an updated project
  const oldContentLen = oldBlocks[0] ? oldBlocks[0].text.length : 0;
  if (oldContentLen < 3) {
    const contentLen = blocks[0] ? blocks[0].text.length : 0;
    if (contentLen > oldContentLen) {
      const maybeInvolvedUserIds = mentions.concat(project.userId);
      const existingProjectNotifications = await r.table('Notification')
        .getAll(r.args(maybeInvolvedUserIds), {index: 'userIds'})
        .filter({
          projectId: project.id,
          type: PROJECT_INVOLVES
        });
      existingProjectNotifications.forEach((notification) => {
        const notificationsAdded = {notifications: [notification]};
        const userId = notification.userIds[0];
        getPubSub().publish(`${NOTIFICATIONS_ADDED}.${userId}`, {notificationsAdded});
      });
    }
  }

  // update changes in the db & push to the pubsub
  if (notificationsToRemove.length) {
    const clearedNotifications = await r.table('Notification')
      .getAll(r.args(notificationsToRemove), {index: 'userIds'})
      .filter({
        projectId: oldProject.id,
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
  if (notificationsToAdd.length) {
    await r.table('Notification').insert(notificationsToAdd);
    notificationsToAdd.forEach((notification) => {
      const notificationsAdded = {notifications: [notification]};
      const userId = notification.userIds[0];
      getPubSub().publish(`${NOTIFICATIONS_ADDED}.${userId}`, {notificationsAdded});
    });
  }
  return {notificationsToRemove, notificationsToAdd};
};

export default publishChangeNotifications;
