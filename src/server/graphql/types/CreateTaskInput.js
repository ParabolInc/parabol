import {GraphQLFloat, GraphQLID, GraphQLInputObjectType, GraphQLString} from 'graphql';
import TaskStatusEnum from 'server/graphql/types/TaskStatusEnum';

const CreateTaskInput = new GraphQLInputObjectType({
  name: 'CreateTaskInput',
  fields: () => ({
    agendaId: {
      type: GraphQLID,
      description: 'foreign key for AgendaItem'
    },
    content: {
      type: GraphQLString
    },
    meetingId: {
      type: GraphQLID,
      description: 'foreign key for the meeting this was created in'
    },
    reflectionGroupId: {
      type: GraphQLID,
      description: 'foreign key for the reflection group this was created from'
    },
    sortOrder: {
      type: GraphQLFloat
    },
    status: {
      type: TaskStatusEnum
    },
    teamId: {
      type: GraphQLID,
      description: 'teamId, the team the task is on'
    },
    userId: {
      type: GraphQLID,
      description: 'userId, the owner of the task'
    }
  })
});

export default CreateTaskInput;
