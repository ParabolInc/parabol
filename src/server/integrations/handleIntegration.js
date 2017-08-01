import {graphql} from 'graphql';
import schema from 'server/graphql/rootSchema';
import closeClientPage from 'server/utils/closeClientPage';
import {GITHUB} from 'universal/utils/constants';

const query = `
  mutation AddProviderMutation($code: ID! $state: ID! $service: IntegrationService!) {
    addProvider(code: $code, state: $state, service: $service)
  }
`;

export default (service) => async (req, res) => {
  if (service === GITHUB) {
    // let the proxy know everything is cool
    res.send(200);
  } else {
    closeClientPage(res);
  }
  const {query: {code, state}} = req;
  const variables = {code, state, service};
  const context = {serverSecret: process.env.AUTH0_CLIENT_SECRET};
  graphql(schema, query, {}, context, variables);
};
