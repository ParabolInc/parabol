import {GraphQLObjectType} from 'graphql';
import agenda from './models/AgendaItem/agendaItemQuery';
import invoice from './models/Invoice/invoiceQuery';
import meeting from './models/Meeting/meetingQuery';
import node from './models/Node/nodeQuery';
import organization from './models/Organization/organizationQuery';
import project from './models/Project/projectQuery';
import provider from './models/Provider/providerQuery';
import team from './models/Team/teamQuery';
import teamMember from './models/TeamMember/teamMemberQuery';
import user from './models/User/userQuery';
import {User} from './models/User/userSchema';
import {toGlobalId} from 'graphql-relay';

const rootFields = Object.assign({
    viewer: {
      type: User,
      resolve: (source, args, {authToken}) => ({
        id: toGlobalId('User', authToken.sub)
      })
    }
  },
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
  name: 'Query',
  fields: () => rootFields
});
