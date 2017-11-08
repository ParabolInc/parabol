import {GraphQLNonNull, GraphQLObjectType} from 'graphql';
import Project from 'server/graphql/types/Project';

const UpdateProjectPayload = new GraphQLObjectType({
  name: 'UpdateProjectPayload',
  fields: () => ({
    project: {
      type: new GraphQLNonNull(Project)
    }
  })
});

export default UpdateProjectPayload;
