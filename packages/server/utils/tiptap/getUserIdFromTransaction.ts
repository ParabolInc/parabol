import {isTransactionOrigin} from '@hocuspocus/server'
import type * as Y from 'yjs'

export const getUserIdFromTransaction = (transaction: Y.Transaction): string | undefined => {
  const origin = isTransactionOrigin(transaction.origin) ? transaction.origin : null
  return origin?.source === 'connection'
    ? origin.connection.context?.userId
    : origin?.source === 'local'
      ? origin.context?.userId
      : undefined
}
