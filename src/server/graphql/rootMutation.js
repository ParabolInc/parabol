import {GraphQLObjectType} from 'graphql';
import cachedUser from './models/CachedUser/cachedUserMutation';
import meeting from './models/Meeting/meetingMutation';
import team from './models/Team/teamMutation';

const rootFields = Object.assign(cachedUser, meeting, team);

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: () => rootFields
});
