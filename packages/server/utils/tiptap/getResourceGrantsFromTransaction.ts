import {isTransactionOrigin} from '@hocuspocus/server'
import type * as Y from 'yjs'
import type {SerializedResourceGrants} from '../../graphql/public/ResourceGrants'

export const getResourceGrantsFromTransaction = (
  transaction: Y.Transaction
): SerializedResourceGrants | undefined => {
  const origin = isTransactionOrigin(transaction.origin) ? transaction.origin : null
  return origin?.source === 'local' ? origin.context?.resourceGrants : undefined
}
