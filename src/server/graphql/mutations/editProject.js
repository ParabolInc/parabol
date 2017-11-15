import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import {getUserId, requireSUOrTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import maybeFromGlobalId from 'server/utils/maybeFromGlobalId';
import {PROJECT_UPDATED} from 'universal/utils/constants';
import UpdateProjectPayload from 'server/graphql/types/UpdateProjectPayload';

export default {
  type: UpdateProjectPayload,
  description: 'Annouce to everyone that you are editing a project',
  args: {
    projectId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '(Relay) The project id that is being edited'
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
    const dbId = maybeFromGlobalId(projectId, 'Project');
    const [teamId] = dbId.split('::');
    requireSUOrTeamMember(authToken, teamId);

    // RESOLUTION
    const mutatorId = socketId;
    const projectUpdated = {
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
