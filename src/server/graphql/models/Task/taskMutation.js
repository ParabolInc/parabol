import r from 'server/database/rethinkDriver';
import {Task, CreateTaskInput, UpdateTaskInput} from './taskSchema';
import {
  GraphQLNonNull,
  GraphQLBoolean
} from 'graphql';
import {requireTeamMemberIsSelf} from '../authorization';


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
      // can the userId mutate this task?
      // the task can be mutated by anyone on the team
      // i can find all the teamMembers on a team & filter for the one with userId

      await requireTeamMemberIsSelf(authToken, newTask.teamMemberId);
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
      await requireTeamMemberIsSelf(authToken, newTask.teamMemberId);
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
