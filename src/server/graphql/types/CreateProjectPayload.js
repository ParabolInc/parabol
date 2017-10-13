import {GraphQLObjectType} from 'graphql';
import Project from 'server/graphql/types/Project';

const CreateProjectPayload = new GraphQLObjectType({
  name: 'CreateProjectPayload',
  fields: () => ({
    project: {
      type: Project
    }
  })
});

export default CreateProjectPayload;
