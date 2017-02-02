import {GraphQLScalarType} from 'graphql';
import {GraphQLError} from 'graphql/error';
import {Kind} from 'graphql/language';
import {emailRegex, urlRegex} from '../../universal/validation/regex';

export const GraphQLEmailType = new GraphQLScalarType({
  name: 'Email',
  serialize: value => value.toLowerCase(),
  parseValue: value => value.toLowerCase(),
  parseLiteral: ast => {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(`Query error: Email is not a string, it is a: ${ast.kind}`, [ast]);
    }
    if (!emailRegex.test(ast.value)) {
      throw new GraphQLError('Query error: Not a valid Email', [ast]);
    }
    if (ast.value.length < 4) {
      throw new GraphQLError('Query error: Email must have a minimum length of 4.', [ast]);
    }
    if (ast.value.length > 300) {
      throw new GraphQLError('Query error: Email is too long.', [ast]);
    }
    return ast.value.toLowerCase();
  }
});

export const GraphQLURLType = new GraphQLScalarType({
  name: 'URL',
  serialize: value => String(value),
  parseValue: value => String(value),
  parseLiteral: ast => {
    // eslint-disable-next-line max-len, no-useless-escape
    if (!urlRegex.test(ast.value)) {
      throw new GraphQLError('Query error: Not a valid URL', [ast]);
    }
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(`Query error: URL is not a string, it is a: ${ast.kind}`, [ast]);
    }
    if (ast.value.length < 1) {
      throw new GraphQLError('Query error: URL must have a minimum length of 1.', [ast]);
    }
    if (ast.value.length > 2083) {
      throw new GraphQLError('Query error: URL is too long.', [ast]);
    }
    return String(ast.value);
  }
});
