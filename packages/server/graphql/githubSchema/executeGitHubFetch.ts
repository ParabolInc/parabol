import AbortController from 'abort-controller'
import {DocumentNode, print} from 'graphql'
import fetch from 'node-fetch'
import sendToSentry from '../../utils/sendToSentry'

const MAX_REQUEST_TIME = 10000
const executeGitHubFetch = async (
  document: DocumentNode,
  variables: Record<string, any>,
  accessToken: string
) => {
  const controller = new AbortController()
  const {signal} = controller
  const timeout = setTimeout(() => {
    controller.abort()
  }, MAX_REQUEST_TIME)
  try {
    const result = await fetch('https://api.github.com/graphql', {
      signal,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json' as const
      },
      body: JSON.stringify({
        query: print(document),
        variables
      })
    })
    clearTimeout(timeout)
    return result.json()
  } catch (e) {
    sendToSentry(e)
    clearTimeout(timeout)
    return {
      errors: [
        {
          type: 'GitHub is down',
          message: e.message
        }
      ],
      data: null
    }
  }
}
export default executeGitHubFetch
