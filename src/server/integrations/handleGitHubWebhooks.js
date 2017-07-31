import {graphql} from 'graphql';
import schema from 'server/graphql/rootSchema';
import closeClientPage from 'server/utils/closeClientPage';

export default async (req, res) => {

  //closeClientPage(res);
  //const {query: {code, state}} = req;
  //const variables = {code, state, service};
  //const context = {serverSecret: process.env.AUTH0_CLIENT_SECRET};
  //graphql(schema, query, {}, context, variables);
};
