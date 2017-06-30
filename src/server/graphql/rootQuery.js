import {GraphQLObjectType} from 'graphql';
import agenda from './models/AgendaItem/agendaItemQuery';
import invoice from './models/Invoice/invoiceQuery';
import meeting from './models/Meeting/meetingQuery';
import organization from './models/Organization/organizationQuery';
import project from './models/Project/projectQuery';
import provider from './models/Provider/providerQuery';
import team from './models/Team/teamQuery';
import teamMember from './models/TeamMember/teamMemberQuery';
import user from './models/User/userQuery';
import node from './models/Node/nodeQuery';

const rootFields = Object.assign({},
  agenda,
  invoice,
  meeting,
  node,
  organization,
  project,
  provider,
  team,
  teamMember,
  user
);

export default new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => rootFields
});
