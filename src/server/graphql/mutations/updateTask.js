import {GraphQLNonNull} from 'graphql';
import ms from 'ms';
import getRethink from 'server/database/rethinkDriver';
import getUsersToIgnore from 'server/graphql/mutations/helpers/getUsersToIgnore';
import publishChangeNotifications from 'server/graphql/mutations/helpers/publishChangeNotifications';
import AreaEnum from 'server/graphql/types/AreaEnum';
import UpdateTaskInput from 'server/graphql/types/UpdateTaskInput';
import UpdateTaskPayload from 'server/graphql/types/UpdateTaskPayload';
import {getUserId, requireTeamMember} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {handleSchemaErrors} from 'server/utils/utils';
import shortid from 'shortid';
import {TASK} from 'universal/utils/constants';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';
import makeTaskSchema from 'universal/validation/makeTaskSchema';
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId';
import getIsSoftTeamMember from 'universal/utils/getIsSoftTeamMember';

const DEBOUNCE_TIME = ms('5m');

export default {
  type: UpdateTaskPayload,
  description: 'Update a task with a change in content, ownership, or status',
  args: {
    area: {
      type: AreaEnum,
      description: 'The part of the site where the creation occurred'
    },
    updatedTask: {
      type: new GraphQLNonNull(UpdateTaskInput),
      description: 'the updated task including the id, and at least one other field'
    }
  },
  async resolve(source, {area, updatedTask}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const now = new Date();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};

    // AUTH
    const viewerId = getUserId(authToken);
    const {id: taskId} = updatedTask;
    const task = await r.table('Task').get(taskId);
    if (!task) {
      throw new Error('Task does not exist');
    }
    const {teamId} = task;
    requireTeamMember(authToken, teamId);

    // VALIDATION
    const schema = makeTaskSchema();
    const {errors, data: validUpdatedTask} = schema(updatedTask);
    handleSchemaErrors(errors);
    const {agendaId, content, status, assigneeId, sortOrder} = validUpdatedTask;
    if (assigneeId) {
      const table = getIsSoftTeamMember(assigneeId) ? 'SoftTeamMember' : 'TeamMember';
      const res = r.table(table).get(assigneeId);
      if (!res) {
        throw new Error('AssigneeId not found', assigneeId);
      }
    }

    // RESOLUTION
    const taskUpdates = {
      agendaId,
      content,
      status,
      tags: content ? getTagsFromEntityMap(JSON.parse(content).entityMap) : undefined,
      teamId,
      assigneeId,
      sortOrder
    };

    if (assigneeId) {
      const isSoftTask = getIsSoftTeamMember(assigneeId);
      taskUpdates.isSoftTask = isSoftTask;
      taskUpdates.userId = isSoftTask ? null : fromTeamMemberId(assigneeId).userId;
      if (assigneeId === false) {
        taskUpdates.userId = null;
      }
    }

    let taskHistory;
    if (Object.keys(taskUpdates).length > 2 || taskUpdates.sortOrder === undefined) {
      // if this is anything but a sort update, log it to history
      taskUpdates.updatedAt = now;
      const mergeDoc = {
        content,
        taskId,
        status,
        assigneeId: taskUpdates.assigneeId,
        isSoftTask: taskUpdates.isSoftTask,
        updatedAt: now,
        tags: taskUpdates.tags
      };
      taskHistory = r.table('TaskHistory')
        .between([taskId, r.minval], [taskId, r.maxval], {index: 'taskIdUpdatedAt'})
        .orderBy({index: 'taskIdUpdatedAt'})
        .nth(-1)
        .default({updatedAt: r.epochTime(0)})
        .do((lastDoc) => {
          return r.branch(
            lastDoc('updatedAt').gt(r.epochTime((now - DEBOUNCE_TIME) / 1000)),
            r.table('TaskHistory').get(lastDoc('id')).update(mergeDoc),
            r.table('TaskHistory').insert(lastDoc.merge(mergeDoc, {id: shortid.generate()}))
          );
        });
    }
    const {newTask, teamMembers} = await r({
      newTask: r.table('Task').get(taskId).update(taskUpdates, {returnChanges: true})('changes')(0)('new_val').default(null),
      history: taskHistory,
      teamMembers: r.table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({
          isNotRemoved: true
        })
        .coerceTo('array')
    });
    const usersToIgnore = getUsersToIgnore(area, teamMembers);
    if (!newTask) {
      throw new Error('Task already updated or does not exist');
    }

    // send task updated messages
    const isPrivate = newTask.tags.includes('private');
    const wasPrivate = task.tags.includes('private');
    const isPrivatized = isPrivate && !wasPrivate;
    const isPublic = !isPrivate || isPrivatized;

    // get notification diffs
    const {notificationsToRemove, notificationsToAdd} = await publishChangeNotifications(newTask, task, viewerId, usersToIgnore);
    const data = {isPrivatized, taskId, notificationsToAdd, notificationsToRemove};
    teamMembers.forEach(({userId}) => {
      if (isPublic || userId === newTask.userId) {
        publish(TASK, userId, UpdateTaskPayload, data, subOptions);
      }
    });

    return data;
  }
};
