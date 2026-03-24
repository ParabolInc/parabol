import type {Plugin} from 'graphql-yoga'
import type {ServerContext} from '../yoga'

export const useRemoveDuplicateTransferEncoding: Plugin<ServerContext> = {
  onResponse({response}) {
    const transferEncoding = response.headers.get('transfer-encoding')
    if (transferEncoding === 'chunked') {
      // uWebSockets.js sets this header, so remove it so it only appears once
      // (graphql-yoga also sets it)
      response.headers.delete('transfer-encoding')
    }
  }
}
