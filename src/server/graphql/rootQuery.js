import {GraphQLObjectType} from 'graphql';
import action from './models/Action/actionQuery';
import agenda from './models/AgendaItem/agendaItemQuery';
import invoice from './models/Invoice/invoiceQuery';
import meeting from './models/Meeting/meetingQuery';
import organization from './models/Organization/organizationQuery';
import outcome from './models/Outcome/outcomeQuery';
import project from './models/Project/projectQuery';
import team from './models/Team/teamQuery';
import teamMember from './models/TeamMember/teamMemberQuery';
import user from './models/User/userQuery';

const rootFields = Object.assign({},
  action,
  agenda,
  invoice,
  meeting,
  organization,
  outcome,
  project,
  team,
  teamMember,
  user
);

export default new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => rootFields
});
