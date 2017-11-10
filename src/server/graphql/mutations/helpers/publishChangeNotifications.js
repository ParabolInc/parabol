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

const getMentions = (content) => {
  const {entityMap} = JSON.parse(content);
  return getTypeFromEntityMap('MENTION', entityMap);
};

const publishChangeNotifications = async (project, oldProject, changeUserId, usersToIgnore) => {
  const r = getRethink();
  const now = new Date();
  const changeAuthorId = `${changeUserId}::${project.teamId}`;
  const oldMentions = getMentions(oldProject.content);
  const mentions = getMentions(project.content);
  // intersect the mentions to get the ones to add and remove
  const notificationsToRemove = oldMentions
    .filter((m) => !mentions.includes(m))
  const notificationsToAdd = mentions
    .filter((m) => !oldMentions.includes(m) &&
      m !== project.userId &&
      changeUserId !== project.userId &&
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
  // TODO filter changeAuthor
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