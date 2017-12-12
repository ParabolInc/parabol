import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import AddOrgApprovalPayload from 'server/graphql/types/AddOrgApprovalPayload';
import {requireTeamMember} from 'server/utils/authorization';
import {ORG_APPROVAL_ADDED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(AddOrgApprovalPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: (source, {teamId}, {authToken, dataLoader, socketId}) => {
    // AUTH
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    const channelName = `${ORG_APPROVAL_ADDED}.${teamId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelName, {filterFn, dataLoader});
  }
};
