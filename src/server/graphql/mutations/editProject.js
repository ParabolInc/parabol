import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import UpdateProjectPayload from 'server/graphql/types/UpdateProjectPayload';
import {getUserId, requireSUOrTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {PROJECT_UPDATED} from 'universal/utils/constants';

export default {
  type: UpdateProjectPayload,
  description: 'Annouce to everyone that you are editing a project',
  args: {
    projectId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The project id that is being edited'
    },
    editing: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the editing is starting, false if it is stopping'
    }
  },
  async resolve(source, {projectId, editing}, {authToken, socketId, getDataLoader}) {
    const dataLoader = getDataLoader();
    const operationId = dataLoader.share();

    // AUTH
    const userId = getUserId(authToken);
    const [teamId] = projectId.split('::');
    requireSUOrTeamMember(authToken, teamId);

    // RESOLUTION
    // grab the project to see if it's private, don't share with other if it is
    const project = await dataLoader.projects.load(projectId);
    const mutatorId = socketId;
    const projectUpdated = {
      project,
      editor: {
        userId,
        projectId,
        editing
      }
    };
    getPubSub().publish(`${PROJECT_UPDATED}.${teamId}`, {projectUpdated, mutatorId, operationId});
    getPubSub().publish(`${PROJECT_UPDATED}.${userId}`, {projectUpdated, mutatorId, operationId});
    return projectUpdated;
  }
};
