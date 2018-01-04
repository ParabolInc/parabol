import {GraphQLObjectType} from 'graphql';
import {resolveProject} from 'server/graphql/resolvers';
import NotifyProjectInvolves from 'server/graphql/types/NotifyProjectInvolves';
import Project from 'server/graphql/types/Project';
import {getUserId} from 'server/utils/authorization';

const CreateProjectPayload = new GraphQLObjectType({
  name: 'CreateProjectPayload',
  fields: () => ({
    project: {
      type: Project,
      resolve: resolveProject
    },
    involvementNotification: {
      type: NotifyProjectInvolves,
      resolve: ({notifications}, args, {authToken}) => {
        if (!notifications) return null;
        return notifications ? notifications.find((n) => n.userIds[0] === getUserId(authToken)) : notifications;
      }
    }
  })
});

export default CreateProjectPayload;
