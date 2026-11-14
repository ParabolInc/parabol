import type {UpdateUserThemeSuccessResolvers} from '../resolverTypes'

export type UpdateUserThemeSuccessSource = {
  viewerId: string
}

const UpdateUserThemeSuccess: UpdateUserThemeSuccessResolvers = {
  user: async ({viewerId}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(viewerId)
  }
}

export default UpdateUserThemeSuccess
