import {GraphQLFloat, GraphQLID, GraphQLInputObjectType, GraphQLString} from 'graphql';
import TaskStatusEnum from 'server/graphql/types/TaskStatusEnum';

const CreateTaskInput = new GraphQLInputObjectType({
  name: 'CreateTaskInput',
  fields: () => ({
    agendaId: {
      type: GraphQLID,
      description: 'foreign key for AgendaItem'
    },
    content: {type: GraphQLString},
    teamId: {
      type: GraphQLID,
      description: 'teamId, the team the task is on'
    },
    userId: {
      type: GraphQLID,
      description: 'userId, the owner of the task'
    },
    sortOrder: {type: GraphQLFloat},
    status: {type: TaskStatusEnum}
  })
});

export default CreateTaskInput;
