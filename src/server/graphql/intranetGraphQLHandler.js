import RethinkDataLoader from 'server/utils/RethinkDataLoader'
import graphql from 'server/graphql/graphql'
import IntranetSchema from 'server/graphql/intranetSchema/intranetSchema'
import sendGraphQLErrorResult from 'server/utils/sendGraphQLErrorResult'
import sanitizeGraphQLErrors from 'server/utils/sanitizeGraphQLErrors'

const intranetHttpGraphQLHandler = (sharedDataLoader) => async (req, res) => {
  const {query, variables} = req.body
  const authToken = req.user || {}
  const dataLoader = sharedDataLoader.add(new RethinkDataLoader(authToken))
  const context = {authToken, dataLoader, socketId: ''}
  const result = await graphql(IntranetSchema, query, {}, context, variables)
  dataLoader.dispose()
  if (result.errors) {
    sendGraphQLErrorResult('HTTP-Intranet', result.errors[0], query, variables, authToken)
  }
  const sanitizedResult = sanitizeGraphQLErrors(result)
  res.send(sanitizedResult)
}

export default intranetHttpGraphQLHandler
