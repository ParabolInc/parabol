import {toGlobalId} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import maybeJoinRepos from 'server/integrations/githubWebhookHandlers/maybeJoinRepos';
import getPubSub from 'server/utils/getPubSub';
import {GITHUB} from 'universal/utils/constants';

const memberAdded = async (body) => {
  const r = getRethink();
  // see who got invited
  const {invitation: {login: userName}, organization: {login: orgName}} = body;

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
    const {repos, accessToken, userId} = provider;
    return maybeJoinRepos(repos, accessToken, userId);
  }));

  // tell all the listeners about all the repos this guy just joined
  joinedIntegrationsByTeam.forEach((integrationsJoined, idx) => {
    const {userId, repos} = providers[idx];
    integrationsJoined.forEach((integrationId) => {
      const integration = repos.find((repo) => repo.id === integrationId);
      const {teamId} = integration;
      const integrationJoined = {
        globalId: toGlobalId(GITHUB, integrationId),
        teamMember: `${userId}::${teamId}`
      };
      getPubSub().publish(`integrationJoined.${teamId}.${GITHUB}`, {integrationJoined});
    })
  });
};

export default memberAdded;