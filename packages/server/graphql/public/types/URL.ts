import {Kind} from 'graphql/language'
import {urlRegex} from 'parabol-client/validation/regex'
import type {UrlScalarConfig} from '../resolverTypes'

const URL: UrlScalarConfig = {
  name: 'URL',
  serialize: (value) => String(value),
  parseValue: (value) => String(value),
  parseLiteral: (ast: any) => {
    if (!urlRegex.test(ast.value)) {
      throw new Error('Query error: Not a valid URL')
    }
    if (ast.kind !== Kind.STRING) {
      throw new Error(`Query error: URL is not a string, it is a: ${ast.kind}`)
    }
    if (ast.value.length < 1) {
      throw new Error('Query error: URL must have a minimum length of 1.')
    }
    if (ast.value.length > 2083) {
      throw new Error('Query error: URL is too long.')
    }
    return String(ast.value)
  }
}

export default URL
