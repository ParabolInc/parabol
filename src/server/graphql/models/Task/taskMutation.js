import r from 'server/database/rethinkDriver';
import {Task, CreateTaskInput} from './taskSchema';
import {
  GraphQLNonNull,
  GraphQLBoolean
} from 'graphql';
import {requireTeamMemberIsSelf} from '../authorization';


export default {
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
      await requireTeamMemberIsSelf(authToken, newTask.teamMemberId);
      const now = new Date();
      const task = {
        ...newTask,
        createdAt: now,
      };
      await r.table('Task').insert(task);
    }
  }
};
