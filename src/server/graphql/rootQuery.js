import {GraphQLObjectType} from 'graphql';
import user from './models/User/userQuery';
import outcome from './models/Outcome/outcomeQuery';

const rootFields = Object.assign({},
  outcome,
  user
);

export default new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => rootFields
});
