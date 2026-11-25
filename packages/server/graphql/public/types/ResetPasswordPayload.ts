import type {ResetPasswordPayloadResolvers} from '../resolverTypes'

export type ResetPasswordPayloadSource = {userId: string}

const ResetPasswordPayload: ResetPasswordPayloadResolvers = {
  user: ({userId}, _args, {dataLoader}) => dataLoader.get('users').loadNonNull(userId),
  userErrors: () => []
}

export default ResetPasswordPayload
