import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import UpdateProjectPayload from 'server/graphql/types/UpdateProjectPayload';
import {getUserId, requireSUOrTeamMember} from 'server/utils/authorization';
import {PROJECT_DELETED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(UpdateProjectPayload),
  args: {
    teamIds: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLID))
    }
  },
  subscribe: async (source, {teamIds}, {authToken, socketId}) => {
    // AUTH
    const userId = getUserId(authToken);
    if (teamIds) {
      teamIds.forEach((teamId) => {
        requireSUOrTeamMember(authToken, teamId);
      });
    }
    const channelIds = teamIds || [userId];

    // RESOLUTION
    const channelNames = channelIds.map((id) => `${PROJECT_DELETED}.${id}`);
    const filterFn = (value) => {
      const {projectUpdated: {project: {tags, userId: projectUserId}}, mutatorId} = value;
      if (mutatorId === socketId) return false;
      const isPrivate = tags.includes('private');
      return !isPrivate || userId === projectUserId;
    };
    return makeSubscribeIter(channelNames, {filterFn});
  }
};
