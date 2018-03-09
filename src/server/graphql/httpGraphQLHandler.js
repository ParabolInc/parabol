import {graphql} from 'graphql';
import RethinkDataLoader from 'server/utils/RethinkDataLoader';
import IntranetSchema from 'server/graphql/intranetSchema/intranetSchema';
import Schema from './rootSchema';
import sendGraphQLErrorResult from 'server/utils/sendGraphQLErrorResult';

export default (sharedDataLoader) => async (req, res) => {
  const {query, variables} = req.body;
  const authToken = req.user || {};
  const dataLoader = sharedDataLoader.add(new RethinkDataLoader(authToken));
  const context = {authToken, dataLoader};
  const result = await graphql(Schema, query, {}, context, variables);
  dataLoader.dispose();
  if (result.errors) {
    sendGraphQLErrorResult('HTTP', result.errors[0], query, variables, authToken);
  }
  res.send(result);
};

export const intranetHttpGraphQLHandler = (sharedDataLoader) => async (req, res) => {
  const {query, variables} = req.body;
  const authToken = req.user || {};
  const dataLoader = sharedDataLoader.add(new RethinkDataLoader(authToken));
  const context = {authToken};
  const result = await graphql(IntranetSchema, query, {}, context, variables);
  dataLoader.dispose();
  if (result.errors) {
    sendGraphQLErrorResult('HTTP-Intranet', result.errors[0], query, variables, authToken);
  }
  res.send(result);
};
