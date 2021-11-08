import {GraphQLEnumType} from 'graphql'

const NotificationStatusEnum = new GraphQLEnumType({
  name: 'NotificationStatusEnum',
  description: 'The status of the notification interaction',
  values: {
    UNREAD: {},
    READ: {},
    CLICKED: {}
  }
})

export type NotificationStatusEnumType = 'UNREAD' | 'READ' | 'CLICKED'

export default NotificationStatusEnum
