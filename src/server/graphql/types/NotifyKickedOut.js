import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';

const NotifyKickedOut = new GraphQLObjectType({
  name: 'NotifyKickedOut',
  description: 'A notification sent to someone who was just kicked off a team',
  interfaces: () => [Notification],
  fields: () => ({
    ...notificationInterfaceFields,
    isKickout: {
      type: GraphQLBoolean,
      description: 'true if kicked out, false if leaving by choice'
    },
    teamName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the team the user is joining'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamId the user was kicked out of'
    }
  })
});

export default NotifyKickedOut;
