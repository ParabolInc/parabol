import {isTransactionOrigin} from '@hocuspocus/server'
import type * as Y from 'yjs'

export const getTokenScopesFromTransaction = (transaction: Y.Transaction): string[] | undefined => {
  const origin = isTransactionOrigin(transaction.origin) ? transaction.origin : null
  return origin?.source === 'local' ? origin.context?.scopes : undefined
}
