import {
  defaultFieldResolver,
  type GraphQLField,
  type GraphQLFieldResolver,
  type GraphQLSchema
} from 'graphql'
import type {Plugin} from 'graphql-yoga'
import {logOperation} from '../logOperation'
import type {ServerContext} from '../yoga'
import {maskCredentials} from './maskCredentials'

interface Config {
  /**
   * A record where the key is the operation and the value is
   * an array of arguments to exclude.
   * Useful for excluding private arguments like passwords
   */
  excludeArgs?: Record<string, (string | number | symbol)[]>
  /**
   * A set of operations that do need to be audited
   */
  includeOps: Set<string>
}

type RootFieldResolver = GraphQLFieldResolver<unknown, ServerContext>

// A mutation fails by throwing, or by returning an Error (permission rules do)
const getFailureReason = (result: unknown) => (result instanceof Error ? result.message : undefined)

const auditRootField =
  (resolve: RootFieldResolver, excludedArgs: (string | number | symbol)[]): RootFieldResolver =>
  async (source, args, context, info) => {
    const authTokenAtStart = context.authToken
    const audit = (failureReason: string | undefined) => {
      const variables = Object.fromEntries(
        Object.entries(args).map(([key, value]) => [
          key,
          excludedArgs.includes(key) ? '******' : value
        ])
      )
      logOperation({
        // a login has no token until it succeeds
        authToken: authTokenAtStart ?? context.authToken,
        personalAccessTokenId: context.personalAccessTokenId,
        ip: context.ip,
        operation: info.fieldName,
        variables: maskCredentials(variables),
        failureReason
      })
    }
    let result: unknown
    try {
      result = await resolve(source, args, context, info)
    } catch (error) {
      audit(error instanceof Error ? error.message : String(error))
      throw error
    }
    audit(getFailureReason(result))
    return result
  }

export const useAuditLogs = (config: Config): Plugin<ServerContext> => {
  if (process.env.AUDIT_LOGS !== 'true') return {}
  const {includeOps, excludeArgs = {}} = config
  const auditedSchemas = new WeakSet<GraphQLSchema>()
  // A schema swap makes a new schema around the same fields (useDeferStream copies it to add its directives)
  const auditedFields = new WeakSet<GraphQLField<unknown, unknown>>()
  // Each audited root field audits itself, wherever it sits in the document
  const auditSchema = (schema: GraphQLSchema) => {
    if (auditedSchemas.has(schema)) return
    auditedSchemas.add(schema)
    const rootTypes = [schema.getQueryType(), schema.getMutationType()]
    rootTypes.forEach((rootType) => {
      if (!rootType) return
      Object.values(rootType.getFields()).forEach((field) => {
        if (!includeOps.has(field.name) || auditedFields.has(field)) return
        auditedFields.add(field)
        field.resolve = auditRootField(
          field.resolve ?? defaultFieldResolver,
          excludeArgs[field.name] ?? []
        )
      })
    })
  }
  return {
    onExecute({args}) {
      auditSchema(args.schema)
    }
  }
}
