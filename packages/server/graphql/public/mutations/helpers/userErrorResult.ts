import type {UserErrorCode} from '../../resolverTypes'

interface Options {
  field?: string
}

const userErrorResult = (code: UserErrorCode, message: string, {field}: Options = {}) => ({
  userErrors: [{code, message, field}]
})

export default userErrorResult
