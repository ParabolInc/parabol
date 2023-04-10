import {GraphQLInterfaceType, GraphQLList, GraphQLObjectType} from 'graphql'
import {getUserId} from '../../utils/authorization'
import errorFilter from '../errorFilter'
import {GQLContext} from '../graphql'
import SetOrgUserRolePayload, {setOrgUserRoleFields} from './SetOrgUserRolePayload'

const SetOrgUserRoleAddedPayload: GraphQLObjectType<any, GQLContext> = new GraphQLObjectType<
  any,
  GQLContext
>({
  name: 'SetOrgUserRoleAddedPayload',
  interfaces: () => [SetOrgUserRolePayload],
  fields: () => ({
    ...setOrgUserRoleFields,
    notificationsAdded: {
      type: new GraphQLList(
        new GraphQLInterfaceType({
          name: 'Notification',
          fields: () => ({})
        })
      ),
      description: 'If promoted, notify them and give them all other admin notifications',
      resolve: async ({notificationIdsAdded}, _args: unknown, {authToken, dataLoader}) => {
        if (!notificationIdsAdded) return []
        const viewerId = getUserId(authToken)
        const notifications = (
          await dataLoader.get('notifications').loadMany(notificationIdsAdded)
        ).filter(errorFilter)
        return notifications.filter((notification) => notification.userId === viewerId)
      }
    }
  })
})

export default SetOrgUserRoleAddedPayload
