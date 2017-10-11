import {GraphQLObjectType} from 'graphql';
import agenda from './models/AgendaItem/agendaItemQuery';
import meeting from './models/Meeting/meetingQuery';
// import {nodeField} from './models/Node/nodeQuery';
import organization from './models/Organization/organizationQuery';
import project from './models/Project/projectQuery';
import team from './models/Team/teamQuery';
import teamMember from './models/TeamMember/teamMemberQuery';
import user from './models/User/userQuery';
import {toGlobalId} from 'graphql-relay';
import User from 'server/graphql/types/User';

export default new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    // node: nodeField,
    viewer: {
      type: User,
      resolve: (source, args, {authToken}) => ({
        id: toGlobalId('User', authToken.sub)
      })
    },
    ...agenda,
    ...meeting,
    ...organization,
    ...project,
    ...team,
    ...teamMember,
    ...user
  })
});
