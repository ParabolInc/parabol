import {GraphQLError, Kind} from 'graphql'
import type {RedirectUriScalarConfig} from '../resolverTypes'

const isRedirectUriValid = (uri: string): boolean => {
  try {
    const url = new URL(uri)
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
    const hasValidProtocol = url.protocol === 'https:' || (isLocalhost && url.protocol === 'http:')

    if (!hasValidProtocol) {
      return false
    }

    if (url.hash) {
      return false
    }

    return true
  } catch {
    return false
  }
}

const RedirectURIScalarType: RedirectUriScalarConfig = {
  name: 'RedirectURI',
  description:
    'A valid OAuth redirect URI (HTTPS required, HTTP allowed for localhost only, no fragments)',
  parseValue(value: unknown) {
    if (typeof value !== 'string') {
      throw new GraphQLError(`RedirectURI must be a string, received: ${typeof value}`, {
        extensions: {code: 'INVALID_REDIRECT_URI'}
      })
    }
    if (!isRedirectUriValid(value)) {
      throw new GraphQLError(
        `Invalid redirect URI: '${value}'. URIs must use HTTPS (or HTTP for localhost) and not contain fragments.`,
        {
          extensions: {code: 'INVALID_REDIRECT_URI'}
        }
      )
    }
    return value
  },
  serialize(value: unknown) {
    return value as string
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(`RedirectURI must be a string, received: ${ast.kind}`, {
        extensions: {code: 'INVALID_REDIRECT_URI'}
      })
    }
    if (!isRedirectUriValid(ast.value)) {
      throw new GraphQLError(
        `Invalid redirect URI: '${ast.value}'. URIs must use HTTPS (or HTTP for localhost) and not contain fragments.`,
        {
          extensions: {code: 'INVALID_REDIRECT_URI'}
        }
      )
    }
    return ast.value
  }
}

export default RedirectURIScalarType
