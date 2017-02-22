import {GraphQLObjectType} from 'graphql';
import invoice from './models/Invoice/invoiceQuery';
import meeting from './models/Meeting/meetingQuery';
import organization from './models/Organization/organizationQuery';
import outcome from './models/Outcome/outcomeQuery';
import project from './models/Project/projectQuery';
import team from './models/Team/teamQuery';
import user from './models/User/userQuery';

const rootFields = Object.assign({},
  invoice,
  meeting,
  organization,
  outcome,
  project,
  team,
  user
);

export default new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => rootFields
});
