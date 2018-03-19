import {GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import AreaEnum from 'server/graphql/types/AreaEnum';
import CreateTaskInput from 'server/graphql/types/CreateTaskInput';
import CreateTaskPayload from 'server/graphql/types/CreateTaskPayload';
import {getUserId, isTeamMember} from 'server/utils/authorization';
import shortid from 'shortid';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';
import makeTaskSchema from 'universal/validation/makeTaskSchema';
import {sendTeamAccessError} from 'server/utils/authorizationErrors';
import sendFailedInputValidation from 'server/utils/sendFailedInputValidation';

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
    if (Object.keys(errors).length) return sendFailedInputValidation(authToken, errors);
    const {teamId, userId, content} = validNewTask;
    if (!isTeamMember(authToken, teamId)) return sendTeamAccessError(authToken, teamId);

    // RESOLUTION
    const teamMemberId = toTeamMemberId(teamId, userId);
    const taskId = shortid.generate();
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

    return data;
  }
};
