import type {ToggleFavoriteTemplatePayloadResolvers} from '../resolverTypes'

export type ToggleFavoriteTemplatePayloadSource = Record<string, any>

const ToggleFavoriteTemplatePayload: ToggleFavoriteTemplatePayloadResolvers = {
  user: async ({userId}, _args, {dataLoader}) => {
    const user = await dataLoader.get('users').loadNonNull(userId)
    return user
  }
}

export default ToggleFavoriteTemplatePayload
