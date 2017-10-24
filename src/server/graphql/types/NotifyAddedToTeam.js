import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';

const NotifyAddedToTeam = new GraphQLObjectType({
  name: 'NotifyAddedToTeam',
  description: 'A notification sent to someone who was just added to a team',
  interfaces: () => [Notification],
  fields: () => ({
    ...notificationInterfaceFields,
    // inviterName: {
    //  type: new GraphQLNonNull(GraphQLString),
    //  description: 'The name of the person that invited them onto the team'
    // },
    teamName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the team the user is joining'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamId the user is joining'
    }
  })
});

export default NotifyAddedToTeam;
