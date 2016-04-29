import {GraphQLObjectType} from 'graphql';
import cachedUser from './models/CachedUser/cachedUserMutation';
import meeting from './models/Meeting/meetingMutation';

const rootFields = Object.assign(cachedUser, meeting);

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: () => rootFields
});
