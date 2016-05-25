import {GraphQLObjectType} from 'graphql';
import cachedUser from './models/CachedUser/cachedUserMutation';
import meeting from './models/Meeting/meetingMutation';
import team from './models/Team/teamMutation';
import teamMember from './models/TeamMember/teamMemberMutation';

const rootFields = Object.assign(cachedUser, meeting, team, teamMember);

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: () => rootFields
});
