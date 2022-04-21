import isValid from '../../isValid'
import {FlagOverLimitPayloadResolvers} from '../resolverTypes'

export type FlagOverLimitPayloadSource =
  | {
      userIds: string[]
    }
  | {error: {message: string}}

const FlagOverLimitPayload: FlagOverLimitPayloadResolvers = {
  users: async (source, _args, {dataLoader}) => {
    if (!('userIds' in source)) return null
    const users = (await dataLoader.get('users').loadMany(source.userIds)).filter(isValid)
    return users
  }
}

export default FlagOverLimitPayload
