import type {CreateImposterTokenPayloadResolvers} from '../resolverTypes'

export type CreateImposterTokenPayloadSource =
  | {
      userId: string
    }
  | {error: {message: string}}

const CreateImposterTokenPayload: CreateImposterTokenPayloadResolvers = {
  user: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const {userId} = source
    return dataLoader.get('users').loadNonNull(userId)
  }
}

export default CreateImposterTokenPayload
