import {GraphQLFloat, GraphQLID, GraphQLInputObjectType, GraphQLString} from 'graphql';
import ProjectStatusEnum from 'server/graphql/types/ProjectStatusEnum';

const CreateProjectInput = new GraphQLInputObjectType({
  name: 'CreateProjectInput',
  fields: () => ({
    agendaId: {
      type: GraphQLID,
      description: '(DB) foreign key for AgendaItem'
    },
    content: {type: GraphQLString},
    teamId: {
      type: GraphQLID,
      description: '(DB) teamId, the team the project is on'
    },
    userId: {
      type: GraphQLID,
      description: '(DB) userId, the owner of the project'
    },
    sortOrder: {type: GraphQLFloat},
    status: {type: ProjectStatusEnum}
  })
});

export default CreateProjectInput;
