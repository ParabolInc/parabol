import type {UpdateUserProfilePayloadResolvers} from '../resolverTypes'

export type UpdateUserProfilePayloadSource = {
  userId: string
}

const UpdateUserProfilePayload: UpdateUserProfilePayloadResolvers = {
  user: (source, _args, {dataLoader}) => {
    const {userId} = source
    return dataLoader.get('users').loadNonNull(userId)
  }
}

export default UpdateUserProfilePayload
