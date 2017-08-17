import {GraphQLScalarType} from 'graphql';
import {Kind} from 'graphql/language';

function parseDate(value) {
  const result = new Date(value);
  if (isNaN(result.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }
  if (value !== result.toJSON()) {
    throw new Error(`Invalid date format, only accepts: YYYY-MM-DDTHH:MM:SS.SSSZ: ${value}`);
  }
  return result;
}

const GraphQLISO8601Type = new GraphQLScalarType({
  name: 'DateTime',

  // Serialize a date to send to the client.
  serialize(value) {
    if (!(value instanceof Date)) {
      throw new Error('Field error: value is not an instance of Date');
    }
    if (isNaN(value.getTime())) {
      throw new Error('Field error: value is an invalid Date');
    }
    return value.toJSON();
  },

  // Parse a date received as a query variable.
  parseValue(value) {
    if (typeof value !== 'string') {
      throw new Error('Field error: value is not an instance of string');
    }
    return parseDate(value);
  },

  // Parse a date received as an inline value.
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new Error(`Query error: Can only parse strings to dates but got a: ${ast.kind}, ${[ast]}`);
    }
    try {
      return parseDate(ast.value);
    } catch (e) {
      throw new Error(`Query error: ${e.message}, ${[ast]}`);
    }
  }
});

export default GraphQLISO8601Type;
