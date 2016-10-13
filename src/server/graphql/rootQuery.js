import {GraphQLObjectType} from 'graphql';
import outcome from './models/Outcome/outcomeQuery';
import project from './models/Project/projectQuery';
import team from './models/Team/teamQuery';
import user from './models/User/userQuery';

const rootFields = Object.assign({},
  outcome,
  project,
  team,
  user
);

export default new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => rootFields
});
