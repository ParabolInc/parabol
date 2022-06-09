import {RemoveAuthIdentitySuccessResolvers} from '../../public/resolverTypes'

export type RemoveAuthIdentitySuccessSource = {
  userIds: string[]
}

const RemoveAuthIdentitySuccess: RemoveAuthIdentitySuccessResolvers = {
  users: async ({id}, _args, {dataLoader}) => {
    return dataLoader.get('').load(id)
  }
}

export default RemoveAuthIdentitySuccess
