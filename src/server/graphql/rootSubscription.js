import {GraphQLObjectType} from 'graphql';
import team from './models/Team/teamSubscription';
import teamMember from './models/TeamMember/teamMemberSubscription';
import presence from './models/Presence/presenceSubscription';
import task from './models/Task/taskSubscription';

const rootFields = Object.assign({},
  presence,
  task,
  team,
  teamMember
);

export default new GraphQLObjectType({
  name: 'RootSubscription',
  fields: () => rootFields
});
