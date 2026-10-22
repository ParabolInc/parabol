import {GraphQLError} from 'graphql'
import {Kind} from 'graphql/language'
import {isValidEmail, normalizeEmail} from 'parabol-client/shared/emailAddress'
import type {EmailScalarConfig} from '../resolverTypes'

const parseEmail = (value: unknown) => {
  if (typeof value !== 'string') {
    throw new GraphQLError(`Email must be a string, not ${typeof value}`)
  }
  const email = normalizeEmail(value)
  if (!isValidEmail(email)) {
    throw new GraphQLError('Not a valid email address')
  }
  return email
}

const Email: EmailScalarConfig = {
  name: 'Email',
  serialize: (value) => (value as string).toLowerCase(),
  parseValue: parseEmail,
  parseLiteral: (ast) => {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(`Email must be a string, not a ${ast.kind}`)
    }
    return parseEmail(ast.value)
  }
}

export default Email
