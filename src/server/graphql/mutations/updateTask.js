import {GraphQLBoolean, GraphQLNonNull} from 'graphql';
import ms from 'ms';
import getRethink from 'server/database/rethinkDriver';
import TaskInput from 'server/graphql/types/TaskInput';
import {getUserId, requireSUOrTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {handleSchemaErrors} from 'server/utils/utils';
import shortid from 'shortid';
import {MEETING, TASK_UPDATED} from 'universal/utils/constants';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';
import makeTaskSchema from 'universal/validation/makeTaskSchema';
import publishChangeNotifications from 'server/graphql/mutations/helpers/publishChangeNotifications';
import AreaEnum from 'server/graphql/types/AreaEnum';

const DEBOUNCE_TIME = ms('5m');

export default {
  type: GraphQLBoolean,
  description: 'Update a task with a change in content, ownership, or status',
  args: {
    area: {
      type: AreaEnum,
      description: 'The part of the site where the creation occurred'
    },
    updatedTask: {
      type: new GraphQLNonNull(TaskInput),
      description: 'the updated task including the id, and at least one other field'
    }
  },
  async resolve(source, {area, updatedTask}, {authToken}) {
    const r = getRethink();

    // AUTH
    // taskId is of format 'teamId::taskId'
    const [teamId] = updatedTask.id.split('::');
    requireSUOrTeamMember(authToken, teamId);

    // VALIDATION
    const schema = makeTaskSchema();
    const {errors, data: validUpdatedTask} = schema(updatedTask);
    handleSchemaErrors(errors);

    // RESOLUTION
    const {id: taskId, sortOrder, agendaId, content, ...historicalTask} = validUpdatedTask;

    const now = new Date();

    const newTask = {
      ...historicalTask,
      agendaId,
      content,
      sortOrder
    };
    const {teamMemberId} = historicalTask;
    if (teamMemberId) {
      const [userId] = teamMemberId.split('::');
      newTask.userId = userId;
    }

    if (content) {
      const {entityMap} = JSON.parse(content);
      newTask.tags = getTagsFromEntityMap(entityMap);
    }
    let taskHistory;
    if (Object.keys(updatedTask).length > 2 || sortOrder === undefined) {
      // if this is anything but a sort update, log it to history
      newTask.updatedAt = now;
      const mergeDoc = {
        ...historicalTask,
        content,
        updatedAt: now,
        taskId,
        tags: newTask.tags
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
    const {taskChanges, usersToIgnore} = await r({
      taskChanges: r.table('Task').get(taskId).update(newTask, {returnChanges: true})('changes')(0).default(null),
      history: taskHistory,
      usersToIgnore: area === MEETING ? await r.table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({
          isCheckedIn: true
        })('userId')
        .coerceTo('array') : []
    });
    if (!taskChanges) return true;
    const myUserId = getUserId(authToken);
    const {new_val: task, old_val: oldTask} = taskChanges;
    publishChangeNotifications(task, oldTask, myUserId, usersToIgnore);
    const taskUpdated = {task};
    // TODO when removing cashay, add in the mutatorId here
    getPubSub().publish(`${TASK_UPDATED}.${teamId}`, {taskUpdated});
    return true;
  }
};
