import type {Plugin} from 'graphql-yoga'
import privateSchema from '../graphql/private/rootSchema'
import type {ServerContext} from '../yoga'

export const usePrivateSchemaForSuperUser: Plugin<ServerContext> = {
  onEnveloped: ({setSchema, context}) => {
    if (!context) return
    const {authToken} = context
    const isSuperUser = authToken?.rol === 'su'
    if (isSuperUser) {
      setSchema(privateSchema)
    }
  }
}
