import isValid from '../../../graphql/isValid'
import type {RemoveAuthIdentityPayloadResolvers} from '../../private/resolverTypes'

export type RemoveAuthIdentityPayloadSource = {
  userIds: string[]
}

const RemoveAuthIdentityPayload: RemoveAuthIdentityPayloadResolvers = {
  users: async ({userIds}, _args, {dataLoader}) => {
    const users = (await dataLoader.get('users').loadMany(userIds)).filter(isValid)
    return users
  }
}

export default RemoveAuthIdentityPayload
