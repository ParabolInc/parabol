import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveOrganization} from '../resolvers'
import Notification, {notificationInterfaceFields} from './Notification'
import {NotificationEnumType} from './NotificationEnum'
import Organization from './Organization'

const NotifyTeamsLimitExceeded = new GraphQLObjectType<any, GQLContext>({
  name: 'NotifyTeamsLimitExceeded',
  description: 'Notification warning about exceeding the teams limit',
  interfaces: () => [Notification],
  isTypeOf: ({type}: {type: NotificationEnumType}) => type === 'TEAMS_LIMIT_EXCEEDED',
  fields: () => ({
    organization: {
      type: new GraphQLNonNull(Organization),
      resolve: resolveOrganization
    },
    ...notificationInterfaceFields
  })
})

export default NotifyTeamsLimitExceeded
