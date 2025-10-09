import type {SetAppLocationSuccessResolvers} from '../resolverTypes'

export type SetAppLocationSuccessSource = {
  userId: string
}

const SetAppLocationSuccess: SetAppLocationSuccessResolvers = {
  user: async ({userId}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(userId)
  }
}

export default SetAppLocationSuccess
