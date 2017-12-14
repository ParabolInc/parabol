import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import UpdateProjectPayload from 'server/graphql/types/UpdateProjectPayload';
import {getUserId, requireTeamMember} from 'server/utils/authorization';
import {PROJECT_UPDATED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(UpdateProjectPayload),
  args: {
    teamIds: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLID))
    }
  },
  subscribe: async (source, {teamIds}, {authToken, socketId, dataLoader}) => {
    // AUTH
    const userId = getUserId(authToken);
    if (teamIds) {
      teamIds.forEach((teamId) => {
        requireTeamMember(authToken, teamId);
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
    // we piggyback editing on this same subscription, but there's no need to resend the whole project, just send the editor
    const resolve = (value) => {
      return value.projectUpdated.editor ? {projectUpdated: {editor: value.projectUpdated.editor}} : value;
    };
    return makeSubscribeIter(channelNames, {filterFn, dataLoader, resolve});
  }
};
