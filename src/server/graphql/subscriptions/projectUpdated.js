import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import UpdateProjectPayload from 'server/graphql/types/UpdateProjectPayload';
import {getUserId, requireSUOrTeamMember} from 'server/utils/authorization';
import {PROJECT_UPDATED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(UpdateProjectPayload),
  args: {
    teamIds: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLID))
    }
  },
  subscribe: async (source, {teamIds}, {authToken, socketId, getDataLoader}) => {
    // AUTH
    const userId = getUserId(authToken);
    if (teamIds) {
      teamIds.forEach((teamId) => {
        requireSUOrTeamMember(authToken, teamId);
      });
    }

    // if teamIds is provided, then we'll listen to all users on those teams
    // else, we just listen to projects the user cares about (assigned, etc.)
    const channelIds = teamIds || [userId];
    // RESOLUTION
    const channelNames = channelIds.map((id) => `${PROJECT_UPDATED}.${id}`);
    const filterFn = (value) => {
      const {projectUpdated: {project: {tags, userId: projectUserId}}, mutatorId} = value;
      if (mutatorId === socketId) return false;
      const isPrivate = tags.includes('private');
      return !isPrivate || userId === projectUserId;
    };
    return makeSubscribeIter(channelNames, {filterFn, getDataLoader});
  }
};
