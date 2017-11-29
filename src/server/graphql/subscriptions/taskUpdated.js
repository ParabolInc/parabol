import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import UpdateTaskPayload from 'server/graphql/types/UpdateTaskPayload';
import {getUserId, requireSUOrTeamMember} from 'server/utils/authorization';
import {TASK_UPDATED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(UpdateTaskPayload),
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
    const channelName = `${TASK_UPDATED}.${teamId}`;
    const filterFn = (value) => {
      const {taskUpdated: {task: {tags, userId: taskUserId}}, mutatorId} = value;
      if (mutatorId === socketId) return false;
      const isPrivate = tags.includes('private');
      return !isPrivate || userId === taskUserId;
    };
    return makeSubscribeIter(channelName, {filterFn});
  }
};
