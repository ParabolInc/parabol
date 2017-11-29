import {GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import CreateTaskPayload from 'server/graphql/types/CreateTaskPayload';
import TaskInput from 'server/graphql/types/TaskInput';
import {getUserId, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import {handleSchemaErrors} from 'server/utils/utils';
import shortid from 'shortid';
import {ASSIGNEE, MEETING, MENTIONEE, NOTIFICATIONS_ADDED, TASK_INVOLVES} from 'universal/utils/constants';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';
import getTypeFromEntityMap from 'universal/utils/draftjs/getTypeFromEntityMap';
import makeTaskSchema from 'universal/validation/makeTaskSchema';
import getPubSub from 'server/utils/getPubSub';
import AreaEnum from 'server/graphql/types/AreaEnum';

export default {
  type: CreateTaskPayload,
  description: 'Create a new task, triggering a CreateCard for other viewers',
  args: {
    newTask: {
      type: new GraphQLNonNull(TaskInput),
      description: 'The new task including an id, status, and type, and teamMemberId'
    },
    area: {
      type: AreaEnum,
      description: 'The part of the site where the creation occurred'
    }
  },
  async resolve(source, {newTask, area}, {authToken, socket}) {
    const r = getRethink();
    const now = new Date();
    // AUTH
    const myUserId = getUserId(authToken);
    // format of id is teamId::taskIdPart
    requireWebsocket(socket);
    const [teamId] = newTask.id.split('::');
    requireSUOrTeamMember(authToken, teamId);

    // VALIDATION
    // TODO make id, status, teamMemberId required
    const schema = makeTaskSchema();
    // ensure that content is not empty
    const {errors, data: validNewTask} = schema({content: 1, ...newTask});
    handleSchemaErrors(errors);

    // RESOLUTION
    const [userId] = validNewTask.teamMemberId.split('::');
    const {content} = validNewTask;
    const {entityMap} = JSON.parse(content);
    const task = {
      ...validNewTask,
      userId,
      createdAt: now,
      createdBy: authToken.sub,
      tags: getTagsFromEntityMap(entityMap),
      teamId,
      updatedAt: now
    };
    const history = {
      id: shortid.generate(),
      content: task.content,
      taskId: task.id,
      status: task.status,
      teamMemberId: task.teamMemberId,
      updatedAt: task.updatedAt
    };
    const {usersToIgnore} = await r({
      task: r.table('Task').insert(task),
      history: r.table('TaskHistory').insert(history),
      usersToIgnore: area === MEETING ? await r.table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({
          isCheckedIn: true
        })('userId')
        .coerceTo('array') : []
    });

    // Almost always you start out with a blank card assigned to you (except for filtered team dash)
    const changeAuthorId = `${myUserId}::${teamId}`;
    const notificationsToAdd = [];
    if (changeAuthorId !== task.teamMemberId && !usersToIgnore.includes(task.userId)) {
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
      .filter((mention) => mention !== myUserId && mention !== task.userId && !usersToIgnore.includes(mention))
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
    if (notificationsToAdd.length) {
      await r.table('Notification').insert(notificationsToAdd);
      notificationsToAdd.forEach((notification) => {
        const notificationsAdded = {notifications: [notification]};
        const notificationUserId = notification.userIds[0];
        getPubSub().publish(`${NOTIFICATIONS_ADDED}.${notificationUserId}`, {notificationsAdded});
      });
    }
    return {task};
  }
};
