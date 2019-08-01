import {GraphQLList, GraphQLObjectType} from 'graphql'
import SetOrgUserRolePayload, {setOrgUserRoleFields} from './SetOrgUserRolePayload'
import {makeResolveNotificationsForViewer} from '../resolvers'
import Notification from './Notification'

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
