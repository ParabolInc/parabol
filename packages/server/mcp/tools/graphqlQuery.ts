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
    'Run a read-only query against Parabol\'s GraphQL API, documented at https://www.parabol.co/developers/. Learn the schema in small steps, since a result over 100,000 characters is cut off: list names first with { __type(name: "Query") { fields { name } } }, then call describe_graphql with one type, such as Task, or one field, such as Query.viewer. A field the connection lacks a scope for fails with FORBIDDEN, and when the field can\'t be null its parent becomes null too: Task fields need tasks:read and Comment fields need comments:read, so select them, inside ... on Task or ... on Comment where the type is a union or interface, only with that scope. Timestamps are UTC. Mutations are refused: use graphql_mutate. Needs the scopes of the fields you select.',
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
