import type {RemoteReflectionDragResolvers} from '../resolverTypes'

const RemoteReflectionDrag: RemoteReflectionDragResolvers = {
  dragUserName: async ({dragUserId}, _args, {dataLoader}) => {
    if (!dragUserId) return null
    const user = await dataLoader.get('users').loadNonNull(dragUserId)
    return user.preferredName
  }
}

export default RemoteReflectionDrag
