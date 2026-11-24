import {z} from 'zod'
import defineTool from '../defineTool'
import getOperationKind from '../getOperationKind'
import runGraphQL from '../runGraphQL'
import {readAnnotations} from '../toolAnnotations'
import toolError from '../toolError'
import toolResult from '../toolResult'

export default defineTool({
  name: 'graphql_query',
  title: 'Run a GraphQL query',
  description:
    'Run a read-only GraphQL query against Parabol and return its data. Learn the schema with an introspection query such as { __type(name: "Task") { fields { name description } } }. Mutations are refused: use graphql_mutate.',
  inputSchema: z.object({
    query: z.string().describe('A GraphQL document containing a query'),
    variables: z.record(z.string(), z.unknown()).optional().describe('Values for $variables'),
    operationName: z
      .string()
      .optional()
      .describe('Which operation to run when the document has several')
  }),
  annotations: readAnnotations,
  run: async (context, {query, variables, operationName}) => {
    const kind = getOperationKind(query, operationName)
    if (kind === 'mutation') {
      return toolError(
        'graphql_query runs queries only. Use graphql_mutate to change data.',
        'BAD_USER_INPUT'
      )
    }
    if (kind !== 'query') {
      return toolError(
        'graphql_query needs a document with one query, or an operationName that picks one.',
        'BAD_USER_INPUT'
      )
    }
    return toolResult(await runGraphQL(context, query, variables, operationName))
  }
})
