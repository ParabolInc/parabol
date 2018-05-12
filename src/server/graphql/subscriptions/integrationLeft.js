import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import {isTeamMember} from 'server/utils/authorization';
import LeaveIntegrationPayload from 'server/graphql/types/LeaveIntegrationPayload';
import IntegrationService from 'server/graphql/types/IntegrationService';
import {sendTeamAccessError} from 'server/utils/authorizationErrors';

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
  subscribe: (source, {service, teamId}, {authToken, dataLoader, socketId}) => {
    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId);
    }

    // RESOLUTION
    const channelName = `integrationLeft.${teamId}.${service}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelName, {filterFn, dataLoader});
  }
};
