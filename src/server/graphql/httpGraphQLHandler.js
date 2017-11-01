import Schema from './rootSchema';
import IntranetSchema from './intranetSchema';
import {graphql} from 'graphql';
import RethinkDataLoader from 'server/utils/RethinkDataLoader';

export default (exchange) => async (req, res) => {
  const {query, variables} = req.body;
  const authToken = req.user || {};
  const dataloader = new RethinkDataLoader(authToken);
  const context = {authToken, exchange, dataloader};
  const result = await graphql(Schema, query, {}, context, variables);
  if (result.errors) {
    console.log('DEBUG GraphQL Error:', result.errors);
  }
  if (Array.isArray(result.errors)) {
    result.errors = result.errors.map((err) => ({message: err.message}));
  }
  res.send(result);
};

export const intranetHttpGraphQLHandler = (exchange) => async (req, res) => {
  const {query, variables} = req.body;
  const authToken = req.user || {};
  const context = {authToken, exchange};
  const result = await graphql(IntranetSchema, query, {}, context, variables);
  if (result.errors) {
    console.log('DEBUG intranet-GraphQL Error:', result.errors);
  }
  if (Array.isArray(result.errors)) {
    result.errors = result.errors.map((err) => ({message: err.message}));
  }
  res.send(result);
};
