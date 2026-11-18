import {isTransactionOrigin} from '@hocuspocus/server'
import type * as Y from 'yjs'
import type {SerializedResourceGrants} from '../../graphql/public/ResourceGrants'

const getTokenContextFromTransaction = (
  transaction: Y.Transaction
): {resourceGrants: SerializedResourceGrants | undefined; scopes: string[] | undefined} => {
  const origin = isTransactionOrigin(transaction.origin) ? transaction.origin : null
  const context = origin?.source === 'local' ? origin.context : undefined
  return {resourceGrants: context?.resourceGrants, scopes: context?.scopes}
}

export default getTokenContextFromTransaction
