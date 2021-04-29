import {DocumentNode, print} from 'graphql'
import fetch from 'node-fetch'

const executeGitHubFetch = async (
  document: DocumentNode,
  variables: Record<string, any>,
  accessToken: string
) => {
  const result = await fetch('https://api.github.com/graphql', {
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
  return result.json()
}
export default executeGitHubFetch
