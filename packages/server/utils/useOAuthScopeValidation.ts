import {GraphQLError, getOperationAST} from 'graphql'
import type {Plugin} from 'graphql-yoga'
import type {ServerContext, UserContext} from '../yoga'

/**
 * GraphQL Yoga plugin that validates tokens have the correct scope
 * when executing GraphQL operations via the OAuth 2.0 API
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
            return
          }

          const operationType = operation.operation

          if (operationType === 'subscription') {
            throw new GraphQLError('Subscriptions are not supported with OAuth tokens', {
              extensions: {code: 'FORBIDDEN'}
            })
          }

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
