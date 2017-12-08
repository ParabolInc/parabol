import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql';
import User from 'server/graphql/types/User';

const ProjectEditorPayload = new GraphQLObjectType({
  name: 'ProjectEditorPayload',
  fields: () => ({
    projectId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The projectId of the card being edited'
    },
    editing: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if they started editing, false if they stopped'
    },
    user: {
      type: User,
      description: 'The user editing the project',
      resolve: ({userId}, args, {getDataLoader}) => {
        return getDataLoader().users.load(userId);
      }
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The userId of the person editing the project'
    }
  })
});

export default ProjectEditorPayload;
