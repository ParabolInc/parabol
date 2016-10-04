import {GraphQLObjectType} from 'graphql';
import auth0 from './models/Auth0/auth0Query';
import user from './models/User/userQuery';
import outcome from './models/Outcome/outcomeQuery';
import project from './models/Project/projectQuery';

const rootFields = Object.assign({},
  auth0,
  outcome,
  project,
  user
);

export default new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => rootFields
});
