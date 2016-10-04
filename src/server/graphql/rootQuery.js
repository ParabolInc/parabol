import {GraphQLObjectType} from 'graphql';
import user from './models/User/userQuery';
import outcome from './models/Outcome/outcomeQuery';
import project from './models/Project/projectQuery';

const rootFields = Object.assign({},
  outcome,
  project,
  user
);

export default new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => rootFields
});
