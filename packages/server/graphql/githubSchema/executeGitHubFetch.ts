import AbortController from 'abort-controller'
import {DocumentNode, print} from 'graphql'
import fetch from 'node-fetch'
import {Threshold} from '../../../client/types/constEnums'
import sendToSentry from '../../utils/sendToSentry'
import {GitHubExecutionResult} from './getRequestDataLoader'

const executeGitHubFetch = async (
  document: DocumentNode,
  variables: Record<string, any>,
  accessToken: string
) => {
  const controller = new AbortController()
  const {signal} = controller
  const timeout = setTimeout(() => {
    controller.abort()
  }, Threshold.MAX_INTEGRATION_FETCH_TIME)
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
    const resJSON = await result.json()
    if (!resJSON.data && !resJSON.errors) {
      const message = String(resJSON.message) || JSON.stringify(resJSON)
      return {
        errors: [
          {
            type: 'GitHub Gateway Error',
            message
          }
        ],
        data: null
      }
    }
    return resJSON as GitHubExecutionResult
  } catch (e) {
    sendToSentry(e)
    clearTimeout(timeout)
    return {
      errors: [
        {
          type: 'GitHub is down',
          message: String(e.message)
        }
      ],
      data: null
    }
  }
}
export default executeGitHubFetch
