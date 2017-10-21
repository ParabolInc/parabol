import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import UpdateProjectPayload from 'server/graphql/types/UpdateProjectPayload';
import {getUserId, requireSUOrTeamMember} from 'server/utils/authorization';
import {PROJECT_UPDATED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(UpdateProjectPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: async (source, {teamId}, {authToken, socketId}) => {
    // AUTH
    const userId = getUserId(authToken);
    requireSUOrTeamMember(authToken, teamId);

    // RESOLUTION
    const channelName = `${PROJECT_UPDATED}.${teamId}`;
    const filterFn = (value) => {
      const {projectUpdated: {project: {tags, userId: projectUserId}}, mutatorId} = value;
      if (mutatorId === socketId) return false;
      const isPrivate = tags.includes('private');
      return !isPrivate || userId === projectUserId;
    };
    return makeSubscribeIter(channelName, {filterFn});
  }
};
