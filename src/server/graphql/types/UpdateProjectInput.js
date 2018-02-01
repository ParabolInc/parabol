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
    assigneeId: {
      type: GraphQLID,
      description: 'The teamMemberId or softTeamMemberId'
    }
  })
});

export default UpdateProjectInput;
