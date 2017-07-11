import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {ProviderRow} from 'server/graphql/models/Provider/providerSchema';
import getPubSub from 'server/utils/getPubSub';
import {requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import {errorObj} from 'server/utils/utils';
import {SLACK} from 'universal/utils/constants';

export const RemoveProviderPayload = new GraphQLObjectType({
  name: 'RemoveProviderPayload',
  fields: () => ({
    providerRow: {
      type: new GraphQLNonNull(ProviderRow)
    }
  })
});

export default {
  name: 'RemoveProvider',
  type: new GraphQLNonNull(RemoveProviderPayload),
  description: 'Disconnect a team from a Provider token',

  args: {
    providerId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the provider to remove'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'the teamId to disconnect from the token'
    }
  },
  resolve: async (source, {providerId, teamId}, {authToken, socket}) => {
    const r = getRethink();

    // AUTH
    requireSUOrTeamMember(authToken, teamId);
    requireWebsocket(socket);

    // RESOLUTION

    // unlink the team from the user's token
    const res = await r.table('Provider')
      .get(providerId)
      .update((user) => ({teamIds: user('teamIds').difference([teamId])}), {returnChanges: true});

    if (res.skipped === 1) {
      throw errorObj({_error: `Provider ${providerId} does not exist`});
    }

    // remove the user from every integration under the provider
    const updatedProvider = res.changes[0];
    if (!updatedProvider) {
      throw errorObj({_error: `Provider ${providerId} did not contain ${teamId}`});
    }
    const {service} = updatedProvider.new_val;
    if (service === SLACK) {
      const providerUpdated = {
        providerRow: {
          accessToken: null,
          service: SLACK
        }
      };
      getPubSub().publish(`providerUpdated.${teamId}`, {providerUpdated});
      const removedSlackChannels = await r.table('SlackIntegration')
        .getAll(teamId, {index: 'teamId'})
        .update({
          isActive: false
        }, {returnChanges: true})('changes');

      removedSlackChannels.forEach((change) => {
        const slackChannelRemoved = {deletedId: change.new_val.id};
        // TODO add in the mutatorId and just remove all the records on the client?
        getPubSub().publish(`slackChannelRemoved.${teamId}`, {slackChannelRemoved});
      });
      return providerUpdated;
    }
    // will never hit this
    return undefined;

    // TODO rewrite
    // const userId = getUserId(authToken);
    // const table = serviceToProvider[service];
    // const integrationChanges = await r.table(table)
    //  .getAll(userId, {index: 'userIds'})
    //  .update((user) => ({userIds: user('userIds').difference([userId])}), {returnChanges: true})('changes');
    // if (integrationChanges.length === 0) return true;
    //
    // // remove the integration entirely if they were the last one on it
    // const promises = integrationChanges.map((integration) => {
    //  const {id, userIds} = integration.new_val;
    //  if (userIds.length === 0) {
    //    return r.table(table).get(id)
    //      .update({
    //        isActive: false,
    //        userIds: []
    //      });
    //  }
    //  return undefined;
    // });
    // await Promise.all(promises);
  }
};
