import type {ResetPasswordPayloadResolvers, UserError} from '../resolverTypes'

export type ResetPasswordPayloadSource = {userId: string} | {userErrors: UserError[]}

const ResetPasswordPayload: ResetPasswordPayloadResolvers = {
  user: (source, _args, {dataLoader}) => {
    if ('userErrors' in source) return null
    return dataLoader.get('users').loadNonNull(source.userId)
  },
  userErrors: (source) => ('userErrors' in source ? source.userErrors : [])
}

export default ResetPasswordPayload
