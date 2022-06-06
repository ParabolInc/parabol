import {getUserId} from '../../../utils/authorization'
import isValid from '../../isValid'
import {AddFeatureFlagPayloadResolvers} from '../resolverTypes'

export type AddFeatureFlagPayloadSource = {userIds: string[]} | {error: {message: string}}

const AddFeatureFlagPayload: AddFeatureFlagPayloadResolvers = {
  user: (_source, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    return dataLoader.get('users').loadNonNull(viewerId)
  },
  users: async (source, _args, {dataLoader}) => {
    if ('error' in source) return []
    const {userIds} = source
    const users = await dataLoader.get('users').loadMany(userIds)
    return users.filter(isValid)
  }
}

export default AddFeatureFlagPayload
