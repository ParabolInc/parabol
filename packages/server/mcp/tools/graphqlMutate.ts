import {z} from 'zod'
import defineTool from '../defineTool'
import getOperationKind from '../getOperationKind'
import runGraphQL from '../runGraphQL'
import {writeAnnotations} from '../toolAnnotations'
import toolError from '../toolError'
import toolResult from '../toolResult'

export default defineTool({
  name: 'graphql_mutate',
  title: 'Run a GraphQL mutation',
  description:
    'Run a GraphQL mutation against Parabol, which changes data, and return its result. Use search_schema and describe_type first to find the mutation and its input. Queries are refused: use graphql_query.',
  inputSchema: {
    query: z.string().describe('A GraphQL document containing a mutation'),
    variables: z.record(z.string(), z.unknown()).optional().describe('Values for $variables'),
    operationName: z
      .string()
      .optional()
      .describe('Which operation to run when the document has several')
  },
  annotations: writeAnnotations,
  run: async (context, {query, variables, operationName}) => {
    const kind = getOperationKind(query, operationName)
    if (kind === 'query') {
      return toolError(
        'graphql_mutate runs mutations only. Use graphql_query to read data.',
        'BAD_USER_INPUT'
      )
    }
    if (kind !== 'mutation') {
      return toolError(
        'graphql_mutate needs a document with one mutation, or an operationName that picks one.',
        'BAD_USER_INPUT'
      )
    }
    return toolResult(await runGraphQL(context, query, variables, operationName))
  }
})
