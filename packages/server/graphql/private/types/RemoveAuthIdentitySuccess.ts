import isValid from '../../../graphql/isValid'
import {RemoveAuthIdentitySuccessResolvers} from '../../private/resolverTypes'

export type RemoveAuthIdentitySuccessSource = {
  userIds: string[]
}

const RemoveAuthIdentitySuccess: RemoveAuthIdentitySuccessResolvers = {
  users: async ({userIds}, _args, {dataLoader}) => {
    const users = (await dataLoader.get('users').loadMany(userIds)).filter(isValid)
    return users
  }
}

export default RemoveAuthIdentitySuccess
