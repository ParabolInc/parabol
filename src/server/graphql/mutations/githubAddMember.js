import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import {fromGlobalId} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import maybeJoinRepos from 'server/safeMutations/maybeJoinRepos';
import getPubSub from 'server/utils/getPubSub';
import {GITHUB} from 'universal/utils/constants';

export default {
  name: 'GitHubAddMember',
  description: 'Receive a webhook from github saying an org member was added',
  type: GraphQLBoolean,
  args: {
    userName: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The github login'
    },
    orgName: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The github org login'
    }
  },
  resolve: async (source, {userName, orgName}, {serverSecret}) => {
    const r = getRethink();

    // AUTH
    if (serverSecret !== process.env.AUTH0_CLIENT_SECRET) {
      throw new Error('Don\'t be rude.');
    }

    // look the person up by their github user name on the provider table
    const providers = await r.table('Provider')
      .getAll(userName, {index: 'providerUserId'})
      .filter({service: GITHUB})
      .filter((doc) => doc('teamIds').count().ne(0))
      .pluck('accessToken', 'userId', 'teamIds')
      .merge((provider) => ({
        repos: r.table(GITHUB)
          .getAll(r.args(provider('teamIds')), {index: 'teamId'})
          .filter({isActive: true})
          .filter((doc) => doc('nameWithOwner').match(`^${orgName}`))
          .pluck('id', 'nameWithOwner', 'teamId')
          .coerceTo('array')
      }));

    // get the ids of all the repos joined
    const joinedIntegrationsByTeam = await Promise.all(providers.map((provider) => {
      const {repos, accessToken, providerUserName, userId} = provider;
      return maybeJoinRepos(repos, accessToken, userId, providerUserName);
    }));

    // tell all the listeners about all the repos this guy just joined

    for (let i = 0; i < joinedIntegrationsByTeam.length; i++) {
      const integrationsJoined = joinedIntegrationsByTeam[i];
      const {userId, repos} = providers[i];
      for (let j = 0; j < integrationsJoined.length; j++) {
        const globalIntegrationId = integrationsJoined[j];
        const {id: localIntegrationId} = fromGlobalId(globalIntegrationId);
        const integration = repos.find((repo) => repo.id === localIntegrationId);
        if (!integration) {
          throw new Error(`No repo found for ${localIntegrationId}`);
        }
        const {teamId} = integration;
        const teamMemberId = `${userId}::${teamId}`;
        r.table('TeamMember').get(teamMemberId).then((teamMember) => {
          const channelName = `integrationJoined.${teamId}.${GITHUB}`;
          const integrationJoined = {
            globalId: globalIntegrationId,
            teamMember
          };
          // no need for a special payload/channel, nothing but joining a repo will occur for now
          getPubSub().publish(channelName, {integrationJoined});
        });
      }
    }
    return true;
  }
};
