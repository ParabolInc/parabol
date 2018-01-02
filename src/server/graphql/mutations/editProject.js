import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import EditProjectPayload from 'server/graphql/types/EditProjectPayload';
import {getUserId, requireTeamMember} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {EDITED, PROJECT} from 'universal/utils/constants';

export default {
  type: EditProjectPayload,
  description: 'Announce to everyone that you are editing a project',
  args: {
    projectId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The project id that is being edited'
    },
    isEditing: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the editing is starting, false if it is stopping'
    }
  },
  async resolve(source, {projectId, isEditing}, {authToken, dataLoader, socketId: mutatorId}) {
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};
    // AUTH
    const viewerId = getUserId(authToken);
    const [teamId] = projectId.split('::');
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    // grab the project to see if it's private, don't share with other if it is
    const project = await dataLoader.get('projects').load(projectId);
    const {isPrivate, userId} = project;
    const data = {projectId, isPrivate, wasPrivate: isPrivate, userId, editorUserId: viewerId, isEditing};
    publish(PROJECT, teamId, EDITED, data, subOptions);
    return {
      projectId,
      userId: viewerId,
      isEditing
    };
  }
};
