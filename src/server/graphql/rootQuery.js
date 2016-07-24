import {GraphQLObjectType} from 'graphql';
import user from './models/User/userQuery';
import team from './models/Team/teamQuery';

const rootFields = Object.assign({},
  user,
  team
);

export default new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => rootFields
});
