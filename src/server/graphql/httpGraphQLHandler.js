import Schema from './rootSchema';
import {graphql} from 'graphql';

export default async(req, res) => {
  const {query, variables} = req.body;
  const authToken = req.user || {};
  const context = {authToken};
  const result = await graphql(Schema, query, {}, context, variables);
  if (result.errors) {
    console.log('DEBUG GraphQL Error:', result.errors);
  }
  if (Array.isArray(result.errors)) {
    result.errors = result.errors.map(err => ({message: err.message}));
  }
  res.send(result);
};
