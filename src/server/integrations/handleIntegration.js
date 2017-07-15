import {graphql} from 'graphql';
import schema from 'server/graphql/rootSchema';
import closeClientPage from 'server/utils/closeClientPage';

const query = `
  mutation AddProviderMutation($code: ID! $state: ID! $service: String!) {
    addProvider(code: $code, state: $state, service: $service)
  }
`;

export default  (service) => async (req, res) => {
  closeClientPage(res);
  const {query: {code, state}} = req;
  const variables = {code, state, service};
  const context = {serverSecret: process.env.AUTH0_CLIENT_SECRET};
  graphql(schema, query, {}, context, variables);
};
