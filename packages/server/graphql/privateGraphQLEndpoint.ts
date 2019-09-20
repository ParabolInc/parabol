import RethinkDataLoader from '../utils/RethinkDataLoader'
import graphql from './graphql'
import intranetSchema from './intranetSchema/intranetSchema'
import sanitizeGraphQLErrors from '../utils/sanitizeGraphQLErrors'
import sendToSentry from '../utils/sendToSentry'
import {getUserId} from '../utils/authorization'
import DataLoaderWarehouse from 'dataloader-warehouse'
import AuthToken from '../database/types/AuthToken'
import {SHARED_DATA_LOADER_TTL} from '../utils/serverConstants'

const privateGraphQLEndpoint = async (query: string, variables: undefined | {[key: string]: any}, authToken: AuthToken) => {
  const sharedDataLoader = new DataLoaderWarehouse({
    onShare: '_share',
    ttl: SHARED_DATA_LOADER_TTL
  })
  const dataLoader = sharedDataLoader.add(new RethinkDataLoader(authToken))
  const context = {authToken, dataLoader}
  const result = await graphql(intranetSchema, query, {}, context, variables)
  dataLoader.dispose()
  if (result.errors) {
    const viewerId = getUserId(authToken)
    const varStr = variables ? JSON.stringify(variables) : ''
    sendToSentry(result.errors[0], {tags: {query, variables: varStr}, userId: viewerId})
  }
  return sanitizeGraphQLErrors(result)
}

export default privateGraphQLEndpoint
