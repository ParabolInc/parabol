import AuthToken from '../../../database/types/AuthToken'
import encodeAuthToken from '../../../utils/encodeAuthToken'
import {CreateImposterTokenPayloadResolvers} from '../resolverTypes'

export type CreateImposterTokenPayloadSource =
  | {
      userId: string
    }
  | {error: {message: string}}

const CreateImposterTokenPayload: CreateImposterTokenPayloadResolvers = {
  authToken: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const {userId} = source
    const user = await dataLoader.get('users').loadNonNull(userId)
    const {tms} = user
    return encodeAuthToken(new AuthToken({sub: userId, tms, rol: 'impersonate'}))
  },
  user: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const {userId} = source
    return dataLoader.get('users').loadNonNull(userId)
  }
}

export default CreateImposterTokenPayload
