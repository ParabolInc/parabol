import {graphql, execute, parse} from 'graphql';
import schema from 'server/graphql/rootSchema';
import closeClientPage from 'server/utils/closeClientPage';
import {SLACK} from 'universal/utils/constants';


const query = `
  mutation AddProviderMutation($code: ID! $state: ID! $service: String!) {
    addProvider(code: $code, state: $state, service: $service)
  }
`;
const document = parse(query);

export default async (req, res) => {
  closeClientPage(res);
  const {query: {code, state}} = req;
  const variables = {code, state, service: SLACK};
  const context = {serverSecret: process.env.AUTH0_CLIENT_SECRET};
  graphql(schema, query, {}, context, variables)
};
