import {GraphQLList, GraphQLObjectType} from 'graphql'
import SetOrgUserRolePayload, {
  setOrgUserRoleFields
} from 'server/graphql/types/SetOrgUserRolePayload'
import {makeResolveNotificationsForViewer} from 'server/graphql/resolvers'
import Notification from 'server/graphql/types/Notification'

const SetOrgUserRoleAddedPayload = new GraphQLObjectType({
  name: 'SetOrgUserRoleAddedPayload',
  interfaces: () => [SetOrgUserRolePayload],
  fields: () => ({
    ...setOrgUserRoleFields,
    notificationsAdded: {
      type: new GraphQLList(Notification),
      description: 'If promoted, notify them and give them all other admin notifications',
      resolve: makeResolveNotificationsForViewer('notificationIdsAdded')
    }
  })
})

export default SetOrgUserRoleAddedPayload
