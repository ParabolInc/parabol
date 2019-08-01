import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {resolveOrganization} from '../resolvers'
import Notification, {notificationInterfaceFields} from './Notification'
import Organization from './Organization'

const NotifyPromoteToOrgLeader = new GraphQLObjectType({
  name: 'NotifyPromoteToOrgLeader',
  description:
    'A notification alerting the user that they have been promoted (to team or org leader)',
  interfaces: () => [Notification],
  fields: () => ({
    organization: {
      type: new GraphQLNonNull(Organization),
      resolve: resolveOrganization
    },
    ...notificationInterfaceFields
  })
})

export default NotifyPromoteToOrgLeader
