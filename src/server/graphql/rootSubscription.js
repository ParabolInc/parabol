import {GraphQLObjectType} from 'graphql';
import agenda from './models/AgendaItem/agendaItemSubscription';
import team from './models/Team/teamSubscription';
import teamMember from './models/TeamMember/teamMemberSubscription';
import presence from './models/Presence/presenceSubscription';
import project from './models/Project/projectSubscription';
import action from './models/Action/actionSubscription';

const rootFields = Object.assign({},
  action,
  agenda,
  presence,
  project,
  team,
  teamMember
);

export default new GraphQLObjectType({
  name: 'RootSubscription',
  fields: () => rootFields
});
