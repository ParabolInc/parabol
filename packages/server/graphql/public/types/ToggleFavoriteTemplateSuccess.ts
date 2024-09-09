import {getUserId} from '../../../utils/authorization'
import {ToggleFavoriteTemplateSuccessResolvers} from '../resolverTypes'

export type ToggleFavoriteTemplateSuccessSource = Record<string, any>

const ToggleFavoriteTemplateSuccess: ToggleFavoriteTemplateSuccessResolvers = {
  user: async (_, _args, {dataLoader, authToken}) => {
    const userId = getUserId(authToken)
    const user = await dataLoader.get('users').loadNonNull(userId)
    return user
  }
}

export default ToggleFavoriteTemplateSuccess
