import {GraphQLID, GraphQLInterfaceType, GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLString} from 'graphql';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import NotificationEnum from 'server/graphql/types/NotificationEnum';

//const resolveTypeLookup = {
//  [FACILITATOR_REQUEST]: FacilitatorRequestMemo,
//  [ADD_TO_TEAM]: AddToTeamMemo
//};

// TODO move from varList to interface
const Notification = new GraphQLObjectType({
  name: 'Notification',
  fields: () => ({
    type: {
      id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique notification id (shortid)'},
      type: NotificationEnum
    },
    orgId: {
      type: GraphQLID,
      description: '*The unique organization ID for this notification. Can be blank for targeted notifications'
    },
    startAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime to activate the notification & send it to the client'
    },
    userIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: '*The userId that should see this notification'
    },
    varList: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
      description: 'a list of variables to feed the notification and create a message client-side'
    }
  }),
  //resolveType(value) {
  //  return resolveTypeLookup[value.type];
  //}
});

export default Notification;