import {z} from 'zod'
import rootSchema from '../../graphql/public/rootSchema'
import defineTool from '../defineTool'
import describeGraphQLName from '../describeGraphQLName'
import {readAnnotations} from '../toolAnnotations'
import toolError from '../toolError'
import {textResult} from '../toolResult'

export default defineTool({
  name: 'describe_graphql',
  title: 'Describe a GraphQL type or field',
  description:
    'Read one piece of the GraphQL schema as SDL with its descriptions. Pass a type name such as Task to get that type, or Type.field such as Mutation.createPage to get that field and the types of its arguments. Types inside those argument types are not expanded: describe them by name. A type over 20,000 characters, such as Mutation, comes back as one line per field with its argument names and return type, so describe it to list names, then describe one field. A name that is not in the schema is refused with BAD_USER_INPUT and the closest matches. Needs no scope.',
  inputSchema: z.object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .describe('A type name such as Task, or Type.field such as Mutation.createPage')
  }),
  annotations: readAnnotations,
  run: async (_context, {name}) => {
    const described = describeGraphQLName(rootSchema, name)
    return 'error' in described
      ? toolError(described.error, 'BAD_USER_INPUT')
      : textResult(described.sdl)
  }
})
