import {parse} from 'graphql'
import type {Plugin} from 'graphql-yoga'
import {findMissingNestedField} from 'nest-graphql-endpoint'
import {getFullSchemaWithAllNestedTypes} from '../graphql/private/rootSchema'
import publicSchema, {
  getPublicSchemaWithAllNestedTypes,
  hasEveryNestedType,
  nestedEndpoints
} from '../graphql/public/rootSchema'
import type {ServerContext} from '../yoga'
import {BoundedCache} from './BoundedCache'
import {Logger} from './Logger'
import {parseWithTokenLimit} from './useArmor'

// null when the schema has every nested field the query uses
const missingFieldByQuery = new BoundedCache<string, string | null>(1000)

const getMissingNestedField = (query: string, isTrusted: boolean) => {
  const cachedField = missingFieldByQuery.get(query)
  if (cachedField !== undefined) return cachedField
  let document
  try {
    document = isTrusted ? parse(query, {noLocation: true}) : parseWithTokenLimit(query)
  } catch {
    // the operation's own parse reports the error
    return null
  }
  const missingField = findMissingNestedField(publicSchema, document, nestedEndpoints) ?? null
  missingFieldByQuery.set(query, missingField)
  if (missingField) Logger.log(`Using every nested type for an operation that uses ${missingField}`)
  return missingField
}

// A production build only has the nested GitHub, GitLab & Linear fields that the app uses.
// An operation that uses another, e.g. from an older client or a personal access token, gets a schema with all of them
export const useNestedSchemaFallback = (): Plugin<ServerContext> => {
  if (hasEveryNestedType) return {}
  return {
    onEnveloped({context, setSchema}) {
      const query = context?.params?.query
      if (!query) return
      const {authToken, docId} = context
      const isSuperUser = authToken?.rol === 'su'
      if (!getMissingNestedField(query, !!docId || isSuperUser)) return
      setSchema(
        isSuperUser ? getFullSchemaWithAllNestedTypes() : getPublicSchemaWithAllNestedTypes()
      )
    }
  }
}
