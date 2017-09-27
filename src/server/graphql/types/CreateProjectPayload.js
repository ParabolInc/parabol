import {GraphQLObjectType} from 'graphql';
import Project from 'server/graphql/models/Project/projectSchema';

const CreateProjectPayload = new GraphQLObjectType({
  name: 'CreateProjectPayload',
  fields: () => ({
    project: {
      type: Project
    }
  })
});

export default CreateProjectPayload;
