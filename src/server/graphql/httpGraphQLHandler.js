// import Schema from './rootSchema';
import {graphql} from 'graphql';

export default async(req, res) => {
  // eslint-disable-next-line global-require
  const Schema = require('./rootSchema');
  const {query, variables, ...newContext} = req.body;
  const authToken = req.user || {};
  const context = {authToken, context: newContext};
  const result = await graphql(Schema, query, null, context, variables);
  if (result.errors) {
    console.log('DEBUG GraphQL Error:', result.errors);
  }
  if (Array.isArray(result.errors)) {
    result.errors = result.errors.map(err => ({message: err.message}));
  }
  res.send(result);
};
