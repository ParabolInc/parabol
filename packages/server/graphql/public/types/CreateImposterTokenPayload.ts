import type {CreateImposterTokenPayloadResolvers} from '../resolverTypes'

export type CreateImposterTokenPayloadSource = {
  userId: string
}

const CreateImposterTokenPayload: CreateImposterTokenPayloadResolvers = {
  user: async (source, _args, {dataLoader}) => {
    const {userId} = source
    return dataLoader.get('users').loadNonNull(userId)
  }
}

export default CreateImposterTokenPayload
