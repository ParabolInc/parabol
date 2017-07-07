import {GraphQLNonNull, GraphQLID, GraphQLList} from 'graphql';
import {requireSUOrSelf, requireSUOrTeamMember} from 'server/utils/authorization';
import {Provider, ProviderMap} from './providerSchema';
import queryIntegrator from 'server/utils/queryIntegrator';
import {errorObj} from 'server/utils/utils';
import {handleRethinkAdd} from '../../../utils/makeChangefeedHandler';
import {withFilter} from 'graphql-subscriptions';
import getPubSub from 'server/graphql/pubsub';

export default {
  providers: {
    type: new GraphQLList(Provider),
    args: {
      teamMemberId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique teamMember ID'
      }
    },
    async resolve(source, {teamMemberId}, {authToken, socket}) {
      // AUTH
      const [userId, teamId] = teamMemberId.split('::');
      requireSUOrSelf(authToken, userId);
      requireSUOrTeamMember(authToken, teamId);

      // RESOLUTION
      const {data, errors} = await queryIntegrator({
        action: 'getProviders',
        payload: {
          teamMemberId
        }
      });
      if (errors) {
        throw errorObj({_error: errors[0]});
      }

      const channel = `providers/${teamMemberId}`;
      data.getIntegrations.forEach((doc) => {
        const feedDoc = handleRethinkAdd(doc);
        socket.emit(channel, feedDoc);
      });
    }
  },
  providerAdded: {
    type: ProviderMap,
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID)
      }
    },
    // TODO insecure, anyone could sub!
    subscribe: withFilter(
      () => getPubSub().asyncIterator('providerAdded'),
      (payload, args, context) => {
        console.log('subbing!', payload, args);
        return payload.teamId === args.teamId
      }
    )
  }
};
