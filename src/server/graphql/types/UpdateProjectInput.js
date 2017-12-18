import {GraphQLFloat, GraphQLID, GraphQLInputObjectType, GraphQLString} from 'graphql';
import ProjectStatusEnum from 'server/graphql/types/ProjectStatusEnum';

const UpdateProjectInput = new GraphQLInputObjectType({
  name: 'UpdateProjectInput',
  fields: () => ({
    id: {
      type: GraphQLID,
      description: 'The project id'
    },
    content: {type: GraphQLString},
    sortOrder: {type: GraphQLFloat},
    status: {type: ProjectStatusEnum},
    userId: {
      type: GraphQLID,
      description: 'the owner of the project'
    }
  })
});

export default UpdateProjectInput;
