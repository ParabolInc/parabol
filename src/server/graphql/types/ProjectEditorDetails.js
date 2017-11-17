import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';

const ProjectEditorDetails = new GraphQLObjectType({
  name: 'ProjectEditorDetails',
  fields: () => ({
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '(Relay) The userId of the person editing the project'
    },
    preferredName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the userId editing the project'
    }
  })
});

export default ProjectEditorDetails;
