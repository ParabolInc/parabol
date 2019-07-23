import {GraphQLList, GraphQLObjectType} from 'graphql'
import SetOrgUserRolePayload, {
  setOrgUserRoleFields
} from 'server/graphql/types/SetOrgUserRolePayload'
import {makeResolveNotificationsForViewer} from 'server/graphql/resolvers'
import Notification from 'server/graphql/types/Notification'

const SetOrgUserRoleRemovedPayload = new GraphQLObjectType({
  name: 'SetOrgUserRoleRemovedPayload',
  interfaces: () => [SetOrgUserRolePayload],
  fields: () => ({
    ...setOrgUserRoleFields,
    notificationsRemoved: {
      type: new GraphQLList(Notification),
      description: 'If demoted, notify them and remove all other admin notifications',
      resolve: makeResolveNotificationsForViewer('', 'notificationsRemoved')
    }
  })
})

export default SetOrgUserRoleRemovedPayload
