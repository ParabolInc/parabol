import {GraphQLObjectType} from 'graphql';
import cachedUser from './models/CachedUser/cachedUserMutation';
import lane from './models/Lanes/laneMutation';
import note from './models/Notes/noteMutation';

const rootFields = {cachedUser, lane, note};

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: () => rootFields
});
