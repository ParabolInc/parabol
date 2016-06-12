import rootSchema from '../graphql/rootSchema';
import {transformSchema} from 'cashay';
import rethinkExit from './rethinkExit';

// side-step 'Error: Schema must be an instance of GraphQLSchema.'
const graphql = require('graphql').graphql;

export default async () => {
  const schema = await transformSchema(rootSchema, graphql);
  rethinkExit();
  return schema;
};
