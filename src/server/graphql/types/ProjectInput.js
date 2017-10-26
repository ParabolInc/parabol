import {GraphQLFloat, GraphQLID, GraphQLInputObjectType, GraphQLString} from 'graphql';
import ProjectStatusEnum from 'server/graphql/types/ProjectStatusEnum';

const ProjectInput = new GraphQLInputObjectType({
  name: 'ProjectInput',
  fields: () => ({
    id: {type: GraphQLID, description: 'The unique team ID'},
    agendaId: {type: GraphQLID},
    content: {type: GraphQLString},
    name: {type: GraphQLString, description: 'The name of the team'},
    orgId: {type: GraphQLID, description: 'The unique orginization ID that pays for the team'},
    teamMemberId: {type: GraphQLID},
    sortOrder: {type: GraphQLFloat},
    status: {type: ProjectStatusEnum}
  })
});

export default ProjectInput;
