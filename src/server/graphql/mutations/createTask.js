import {GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import getUsersToIgnore from 'server/graphql/mutations/helpers/getUsersToIgnore';
import AreaEnum from 'server/graphql/types/AreaEnum';
import CreateTaskInput from 'server/graphql/types/CreateTaskInput';
import CreateTaskPayload from 'server/graphql/types/CreateTaskPayload';
import {getUserId, requireTeamMember} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {handleSchemaErrors} from 'server/utils/utils';
import shortid from 'shortid';
import {ASSIGNEE, MENTIONEE, NOTIFICATION, TASK, TASK_INVOLVES} from 'universal/utils/constants';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';
import getTypeFromEntityMap from 'universal/utils/draftjs/getTypeFromEntityMap';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';
import makeTaskSchema from 'universal/validation/makeTaskSchema';

export default {
  type: CreateTaskPayload,
  description: 'Create a new task, triggering a CreateCard for other viewers',
  args: {
    newTask: {
      type: new GraphQLNonNull(CreateTaskInput),
      description: 'The new task including an id, status, and type, and teamMemberId'
    },
    area: {
      type: AreaEnum,
      description: 'The part of the site where the creation occurred'
    }
  },
  async resolve(source, {newTask, area}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const now = new Date();
    const subOptions = {operationId, mutatorId};
    // AUTH
    // VALIDATION
    const viewerId = getUserId(authToken);
    const schema = makeTaskSchema();
    const {errors, data: validNewTask} = schema({content: 1, ...newTask});
    handleSchemaErrors(errors);
    const {teamId, userId, content} = validNewTask;
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    const teamMemberId = toTeamMemberId(teamId, userId);
    const taskId = `${teamId}::${shortid.generate()}`;
    const {entityMap} = JSON.parse(content);
    const tags = getTagsFromEntityMap(entityMap);
    const task = {
      id: taskId,
      agendaId: validNewTask.agendaId,
      content: validNewTask.content,
      createdAt: now,
      createdBy: viewerId,
      isSoftTask: false,
      sortOrder: validNewTask.sortOrder,
      status: validNewTask.status,
      tags,
      teamId,
      assigneeId: teamMemberId,
      updatedAt: now,
      userId
    };
    const history = {
      id: shortid.generate(),
      content: task.content,
      taskId: task.id,
      status: task.status,
      assigneeId: task.assigneeId,
      updatedAt: task.updatedAt
    };
    const {teamMembers} = await r({
      task: r.table('Task').insert(task),
      history: r.table('TaskHistory').insert(history),
      teamMembers: r.table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({
          isNotRemoved: true
        })
        .coerceTo('array')
    });
    const usersToIgnore = getUsersToIgnore(area, teamMembers);

    // Handle notifications
    // Almost always you start out with a blank card assigned to you (except for filtered team dash)
    const changeAuthorId = toTeamMemberId(teamId, viewerId);
    const notificationsToAdd = [];
    if (changeAuthorId !== task.assigneeId && !usersToIgnore.includes(task.userId)) {
      notificationsToAdd.push({
        id: shortid.generate(),
        startAt: now,
        type: TASK_INVOLVES,
        userIds: [userId],
        involvement: ASSIGNEE,
        taskId: task.id,
        changeAuthorId,
        teamId
      });
    }

    getTypeFromEntityMap('MENTION', entityMap)
      .filter((mention) => mention !== viewerId && mention !== task.userId && !usersToIgnore.includes(mention))
      .forEach((mentioneeUserId) => {
        notificationsToAdd.push({
          id: shortid.generate(),
          startAt: now,
          type: TASK_INVOLVES,
          userIds: [mentioneeUserId],
          involvement: MENTIONEE,
          taskId: task.id,
          changeAuthorId,
          teamId
        });
      });
    const data = {taskId, notifications: notificationsToAdd};

    if (notificationsToAdd.length) {
      await r.table('Notification').insert(notificationsToAdd);
      notificationsToAdd.forEach((notification) => {
        const {userIds: [notificationUserId]} = notification;
        publish(NOTIFICATION, notificationUserId, CreateTaskPayload, data, subOptions);
      });
    }

    const isPrivate = tags.includes('private');
    teamMembers.forEach((teamMember) => {
      if (!isPrivate || teamMember.userId === userId) {
        publish(TASK, teamMember.userId, CreateTaskPayload, data, subOptions);
      }
    });
    return data;
  }
};
