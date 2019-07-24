import RethinkDataLoader from '../utils/RethinkDataLoader'
import graphql from './graphql'
import IntranetSchema from './intranetSchema/intranetSchema'
import sanitizeGraphQLErrors from '../utils/sanitizeGraphQLErrors'
import sendToSentry from '../utils/sendToSentry'
import {getUserId} from '../utils/authorization'

const intranetHttpGraphQLHandler = (sharedDataLoader) => async (req, res) => {
  const {query, variables} = req.body
  const authToken = req.user || {}
  const dataLoader = sharedDataLoader.add(new RethinkDataLoader(authToken))
  const context = {authToken, dataLoader, socketId: ''}
  const result = await graphql(IntranetSchema, query, {}, context, variables)
  dataLoader.dispose()
  if (result.errors) {
    const viewerId = getUserId(authToken)
    sendToSentry(result.errors[0], {tags: {query, variables}, userId: viewerId})
  }
  const sanitizedResult = sanitizeGraphQLErrors(result)
  res.send(sanitizedResult)
}

export default intranetHttpGraphQLHandler
