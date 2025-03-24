import {UpdateUserProfilePayloadResolvers} from '../resolverTypes'

export type UpdateUserProfilePayloadSource =
  | {
      userId: string
    }
  | {error: {message: string}}

const UpdateUserProfilePayload: UpdateUserProfilePayloadResolvers = {
  user: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const {userId} = source
    return dataLoader.get('users').loadNonNull(userId)
  }
}

export default UpdateUserProfilePayload
