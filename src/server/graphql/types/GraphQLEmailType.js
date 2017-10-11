import {GraphQLScalarType} from 'graphql';
import {Kind} from 'graphql/language';
import {emailRegex} from 'universal/validation/regex';

const GraphQLEmailType = new GraphQLScalarType({
  name: 'Email',
  serialize: (value) => value.toLowerCase(),
  parseValue: (value) => value.toLowerCase(),
  parseLiteral: (ast) => {
    if (ast.kind !== Kind.STRING) {
      throw new Error(`Query error: Email is not a string, it is a: ${ast.kind}`, [ast]);
    }
    if (!emailRegex.test(ast.value)) {
      throw new Error('Query error: Not a valid Email', [ast]);
    }
    if (ast.value.length < 4) {
      throw new Error('Query error: Email must have a minimum length of 4.', [ast]);
    }
    if (ast.value.length > 300) {
      throw new Error('Query error: Email is too long.', [ast]);
    }
    return ast.value.toLowerCase();
  }
});

export default GraphQLEmailType;
