import type {Plugin} from 'graphql-yoga'
import type {ServerContext} from '../yoga'

export const useSchemaLink: Plugin<ServerContext> = {
  onResponse({response}) {
    response.headers.set('Link', '</graphql/schema.graphql>; rel="describedby"')
  }
}
