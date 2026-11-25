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
    'Run a GraphQL mutation against Parabol, which changes data, and return its result. Find the mutation with graphql_query, first listing names only with { __type(name: "Mutation") { fields { name } } }, then reading its payload with { __type(name: "ArchiveTeamPayload") { fields { name type { name } } } }: asking for the arguments of every mutation at once is too large. Every mutation returns a payload object, so select what changed, such as mutation { archiveTeam(teamId: "...") { team { id isArchived } } }. Mutations in one document run one after another with no rollback: if one fails, the rest are skipped, the earlier ones stay applied, and the error path names the failed one, so use one mutation per call when order or atomicity matters. A field the connection lacks a scope for fails with FORBIDDEN and makes its parent null: Task fields need tasks:read and Comment fields need comments:read, so select them, inside ... on Task or ... on Comment where the type is a union or interface, only with that scope. A write can succeed even though reading back an unscoped field fails, so without the read scope select only id rather than retrying, which would repeat the write. Timestamps are UTC. Queries are refused: use graphql_query. Needs the scopes of the mutations you run.',
  inputSchema: z.object({
    query: z.string().describe('A GraphQL document containing a mutation'),
    variables: z.record(z.string(), z.unknown()).optional().describe('Values for $variables'),
    operationName: z
      .string()
      .optional()
      .describe('Which operation to run when the document has several')
  }),
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
