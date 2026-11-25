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
    'Read one piece of the GraphQL schema as SDL with its descriptions, which is far smaller than introspecting. Pass a type name such as Task to get that type, or Type.field such as Mutation.createPage to get that field and the types of its arguments. Types inside those argument types are not expanded: describe them by name. List names first with graphql_query and { __type(name: "Mutation") { fields { name } } }. A name that is not in the schema is refused with BAD_USER_INPUT and the closest matches, and an answer over 100,000 characters is cut off. Needs no scope.',
  inputSchema: z.object({
    name: z
      .string()
      .trim()
      .min(1)
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
