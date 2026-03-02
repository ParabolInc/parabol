import type {ResetPasswordPayloadResolvers} from '../resolverTypes'

export type ResetPasswordPayloadSource = {userId: string} | {error: {message: string}}

const ResetPasswordPayload: ResetPasswordPayloadResolvers = {
  user: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('users').loadNonNull(source.userId)
  }
}

export default ResetPasswordPayload
