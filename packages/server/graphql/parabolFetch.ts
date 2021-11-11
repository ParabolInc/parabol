import ServerAuthToken from '../database/types/ServerAuthToken'
import executeGraphQL from './executeGraphQL'
import sendToSentry from '../utils/sendToSentry'

const parabolFetch = async (query: string, variables: Record<string, unknown>) => {
  const result = await executeGraphQL({
    authToken: new ServerAuthToken(),
    query,
    variables,
    isPrivate: true
  })

  if (result.errors) {
    const [firstError] = result.errors
    const safeError = new Error(firstError.message)
    safeError.stack = (firstError as Error).stack
    sendToSentry(safeError)
  }
  if (!result.data) {
    sendToSentry(new Error('HS Parabol did not return data'), {
      tags: {query, variables: JSON.stringify(variables)}
    })
  }
  return result.data
}

export default parabolFetch
