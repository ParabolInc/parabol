import RethinkDataLoader from 'server/utils/RethinkDataLoader'
import graphql from 'server/graphql/graphql'
import IntranetSchema from 'server/graphql/intranetSchema/intranetSchema'
import sanitizeGraphQLErrors from 'server/utils/sanitizeGraphQLErrors'
import sendToSentry from 'server/utils/sendToSentry'
import {getUserId} from 'server/utils/authorization'

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
