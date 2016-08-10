import r from 'server/database/rethinkDriver';
import {Task, CreateTaskInput, UpdateTaskInput} from './taskSchema';
import {
  GraphQLNonNull,
  GraphQLBoolean
} from 'graphql';
import {requireSUOrTeamMember} from '../authorization';

export default {
  updateTask: {
    type: GraphQLBoolean,
    description: 'Update a task with a change in content, ownership, or status',
    args: {
      updatedTask: {
        type: new GraphQLNonNull(UpdateTaskInput),
        description: 'the updated task including the id, and at least one other field'
      }
    },
    async resolve(source, {updatedTask}, {authToken}) {
      const {id, ...task} = updatedTask;
      // id is of format 'teamId::taskId'
      const [teamId] = id.split('::');
      requireSUOrTeamMember(authToken, teamId);
      await r.table('Task').get(id).update(task);
      return true;
    }
  },
  createTask: {
    type: GraphQLBoolean,
    description: 'Create a new task, triggering a CreateCard for other viewers',
    args: {
      newTask: {
        type: new GraphQLNonNull(CreateTaskInput),
        description: 'The new task including an id, status, and type, and teamMemberId'
      }
    },
    async resolve(source, {newTask}, {authToken}) {
      const {id} = newTask;
      // format of id is teamId::taskIdPart
      const [teamId] = id.split('::');
      requireSUOrTeamMember(authToken, teamId);
      const now = new Date();
      const task = {
        ...newTask,
        createdAt: now,
        updatedAt: now
      };
      await r.table('Task').insert(task);
    }
  }
};
