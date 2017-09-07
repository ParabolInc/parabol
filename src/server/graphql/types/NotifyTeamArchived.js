import {GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import Notification from 'server/graphql/types/Notification';
import NotificationEnum from 'server/graphql/types/NotificationEnum';

const NotifyTeamArchived = new GraphQLObjectType({
  name: 'NotifyTeamArchived',
  description: 'A notification alerting the user that a team they were on is now archived',
  interfaces: () => [Notification],
  fields: () => ({
    teamName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the team that has been archived'
    },
    type: {
      type: new GraphQLNonNull(NotificationEnum)
    }
  })
});

export default NotifyTeamArchived;
