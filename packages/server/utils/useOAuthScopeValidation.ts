import {GraphQLError, getOperationAST} from 'graphql'
import type {Plugin} from 'graphql-yoga'
import type {ServerContext, UserContext} from '../yoga'

/**
 * GraphQL Yoga plugin that validates OAuth2 tokens have the correct scope
 * based on the operation type being executed.
 *
 * - Queries require 'graphql:query' scope
 * - Mutations require 'graphql:mutation' scope
 * - Super users bypass this validation
 */
export const useOAuthScopeValidation = (): Plugin<ServerContext & UserContext> => {
  return {
    onExecute({args}) {
      return {
        onExecuteDone() {
          const {contextValue, document, operationName} = args
          const {authToken} = contextValue

          // Only validate OAuth tokens (not regular session tokens or super users)
          if (!authToken || authToken.iss !== 'parabol-oauth2' || authToken.rol === 'su') {
            return
          }

          // Determine the operation type
          const operation = getOperationAST(document, operationName ?? undefined)
          if (!operation) {
            return // Should not happen, but guard against it
          }

          const operationType = operation.operation

          // Subscriptions are not currently supported
          if (operationType === 'subscription') {
            throw new GraphQLError('Subscriptions are not supported with OAuth tokens', {
              extensions: {code: 'FORBIDDEN'}
            })
          }

          // Validate scope matches operation type
          const scopes = authToken.scp || []
          const requiredScope = operationType === 'mutation' ? 'graphql:mutation' : 'graphql:query'

          if (!scopes.includes(requiredScope)) {
            throw new GraphQLError(
              `Insufficient scope. The '${requiredScope}' scope is required to execute ${operationType} operations.`,
              {
                extensions: {
                  code: 'FORBIDDEN',
                  requiredScope,
                  providedScopes: scopes
                }
              }
            )
          }
        }
      }
    }
  }
}
