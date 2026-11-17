import type {UserErrorCode} from '../../resolverTypes'

interface Options {
  field?: string
  // tabs that loaded before userErrors existed read error.message, and some compare it to a fixed string
  legacyMessage?: string
}

const userErrorResult = (
  code: UserErrorCode,
  message: string,
  {field, legacyMessage = message}: Options = {}
) => ({
  error: {message: legacyMessage},
  userErrors: [{code, message, field}]
})

export default userErrorResult
