import {GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import Notification from 'server/graphql/types/Notification';
import NotificationEnum from 'server/graphql/types/NotificationEnum';

const NotifyPromotion = new GraphQLObjectType({
  name: 'NotifyPromotion',
  description: 'A notification alerting the user that they have been promoted (to team or org leader)',
  interfaces: () => [Notification],
  fields: () => ({
    groupName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The team or org name they are now in charge of'
    },
    type: {
      type: new GraphQLNonNull(NotificationEnum)
    }
  })
});

export default NotifyPromotion;
