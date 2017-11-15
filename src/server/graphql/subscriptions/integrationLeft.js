import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import {requireSUOrTeamMember} from 'server/utils/authorization';
import LeaveIntegrationPayload from 'server/graphql/types/LeaveIntegrationPayload';
import IntegrationService from 'server/graphql/types/IntegrationService';

export default {
  type: new GraphQLNonNull(LeaveIntegrationPayload),
  args: {
    service: {
      type: new GraphQLNonNull(IntegrationService)
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: (source, {service, teamId}, {authToken, getDataLoader, socketId}) => {
    // AUTH
    requireSUOrTeamMember(authToken, teamId);

    // RESOLUTION
    const channelName = `integrationLeft.${teamId}.${service}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelName, {filterFn, getDataLoader});
  }
};
