import {GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';

const NotifyPromotion = new GraphQLObjectType({
  name: 'NotifyPromotion',
  description: 'A notification alerting the user that they have been promoted (to team or org leader)',
  interfaces: () => [Notification],
  fields: () => ({
    groupName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The team or org name they are now in charge of'
    },
    ...notificationInterfaceFields
  })
});

export default NotifyPromotion;
