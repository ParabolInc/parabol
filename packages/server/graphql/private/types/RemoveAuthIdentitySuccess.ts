import {RemoveAuthIdentitySuccessResolvers} from '../../private/resolverTypes'

export type RemoveAuthIdentitySuccessSource = {
  userIds: string[]
}

const RemoveAuthIdentitySuccess: RemoveAuthIdentitySuccessResolvers = {
  users: async ({userIds}, _args, {dataLoader}) => {
    return dataLoader.get('').loadMany(userIds)
  }
}

export default RemoveAuthIdentitySuccess
