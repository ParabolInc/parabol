import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveOrganization} from '../resolvers'
import Notification, {notificationInterfaceFields} from './Notification'
import {NotificationEnumType} from './NotificationEnum'
import Organization from './Organization'

const NotifyPromoteToOrgLeader = new GraphQLObjectType<any, GQLContext>({
  name: 'NotifyPromoteToOrgLeader',
  description:
    'A notification alerting the user that they have been promoted (to team or org leader)',
  interfaces: () => [Notification],
  isTypeOf: ({type}: {type: NotificationEnumType}) => type === 'PROMOTE_TO_BILLING_LEADER',
  fields: () => ({
    organization: {
      type: new GraphQLNonNull(Organization),
      resolve: resolveOrganization
    },
    ...notificationInterfaceFields
  })
})

export default NotifyPromoteToOrgLeader
