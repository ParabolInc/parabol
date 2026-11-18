import type {UpdateUserThemePayloadResolvers} from '../resolverTypes'

export type UpdateUserThemePayloadSource = {
  viewerId: string
}

const UpdateUserThemePayload: UpdateUserThemePayloadResolvers = {
  user: async ({viewerId}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(viewerId)
  }
}

export default UpdateUserThemePayload
