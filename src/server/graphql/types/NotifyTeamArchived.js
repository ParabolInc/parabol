import {GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';

const NotifyTeamArchived = new GraphQLObjectType({
  name: 'NotifyTeamArchived',
  description: 'A notification alerting the user that a team they were on is now archived',
  interfaces: () => [Notification],
  fields: () => ({
    teamName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the team that has been archived'
    },
    ...notificationInterfaceFields
  })
});

export default NotifyTeamArchived;
