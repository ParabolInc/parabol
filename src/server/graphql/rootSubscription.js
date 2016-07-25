import {GraphQLObjectType} from 'graphql';
import team from './models/Team/teamSubscription';
import teamMember from './models/TeamMember/teamMemberSubscription';
import presence from './models/Presence/presenceSubscription';

const rootFields = Object.assign({},
  presence,
  team,
  teamMember
);

export default new GraphQLObjectType({
  name: 'RootSubscription',
  fields: () => rootFields
});
