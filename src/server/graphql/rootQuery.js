import {GraphQLObjectType} from 'graphql';
import cachedUser from './models/CachedUser/cachedUserQuery';
import team from './models/Team/teamQuery';

const rootFields = Object.assign(cachedUser, team);

export default new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => rootFields
});
