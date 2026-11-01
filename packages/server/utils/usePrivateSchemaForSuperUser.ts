import type {Plugin} from 'graphql-yoga'
import privateSchema from '../graphql/private/rootSchema'
import publicSchema from '../graphql/public/rootSchema'
import type {ServerContext} from '../yoga'

export const usePrivateSchemaForSuperUser: Plugin<ServerContext> = {
  onEnveloped: ({setSchema, context}) => {
    // envelop keeps a single schema for all requests, so every request must set the one it needs
    setSchema(context?.authToken?.rol === 'su' ? privateSchema : publicSchema)
  }
}
