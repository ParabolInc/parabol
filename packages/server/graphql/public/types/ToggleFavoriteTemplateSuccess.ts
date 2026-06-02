import type {ToggleFavoriteTemplateSuccessResolvers} from '../resolverTypes'

export type ToggleFavoriteTemplateSuccessSource = Record<string, any>

const ToggleFavoriteTemplateSuccess: ToggleFavoriteTemplateSuccessResolvers = {
  user: async ({userId}, _args, {dataLoader}) => {
    const user = await dataLoader.get('users').loadNonNull(userId)
    return user
  }
}

export default ToggleFavoriteTemplateSuccess
