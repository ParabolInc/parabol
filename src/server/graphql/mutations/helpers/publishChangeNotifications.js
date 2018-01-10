import getRethink from 'server/database/rethinkDriver';
import shortid from 'shortid';
import {ASSIGNEE, MENTIONEE, PROJECT_INVOLVES} from 'universal/utils/constants';
import getTypeFromEntityMap from 'universal/utils/draftjs/getTypeFromEntityMap';

const publishChangeNotifications = async (project, oldProject, changeUserId, usersToIgnore) => {
  const r = getRethink();
  const now = new Date();
  const changeAuthorId = `${changeUserId}::${project.teamId}`;
  const {entityMap: oldEntityMap, blocks: oldBlocks} = JSON.parse(oldProject.content);
  const {entityMap, blocks} = JSON.parse(project.content);
  const wasPrivate = oldProject.tags.includes('private');
  const isPrivate = project.tags.includes('private');
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
      userId !== project.userId &&
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
      projectId: project.id,
      changeAuthorId,
      teamId: project.teamId
    }));

  // add in the assignee changes
  if (oldProject.teamMemberId !== project.teamMemberId) {
    if (project.userId !== changeUserId && !usersToIgnore.includes(project.userId)) {
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
    userIdsToRemove.push(oldProject.userId);
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
      notificationsToAdd.push(...existingProjectNotifications);
    }
  }

  // update changes in the db
  const {notificationsToRemove} = await r({
    notificationsToRemove: userIdsToRemove.length === 0 ? [] : r.table('Notification')
      .getAll(r.args(userIdsToRemove), {index: 'userIds'})
      .filter({
        projectId: oldProject.id,
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
