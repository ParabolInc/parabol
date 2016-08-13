import r from 'server/database/rethinkDriver';
import {Task, CreateTaskInput, UpdateTaskInput} from './taskSchema';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLString
} from 'graphql';
import {requireSUOrTeamMember} from '../authorization';
import rebalanceTask from './rebalanceTask';

export default {
  updateTask: {
    type: GraphQLBoolean,
    description: 'Update a task with a change in content, ownership, or status',
    args: {
      updatedTask: {
        type: new GraphQLNonNull(UpdateTaskInput),
        description: 'the updated task including the id, and at least one other field'
      },
      rebalance: {
        type: GraphQLString,
        description: 'the name of a status if the sort order got so out of whack that we need to reset the btree'
      }
    },
    async resolve(source, {updatedTask, rebalance}, {authToken}) {
      const {id, ...task} = updatedTask;
      // id is of format 'teamId::taskId'
      const [teamId] = id.split('::');
      requireSUOrTeamMember(authToken, teamId);
      const now = new Date();
      const newTask = {
        ...task,
        updatedAt: now
      };
      // we could possibly combine this into the rebalance if we did a resort on the server, but separate logic is nice
      await r.table('Task').get(id).update(newTask);
      if (rebalance) {
        await rebalanceTask(rebalance, teamId);
      }
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
