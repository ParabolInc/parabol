import {fetch} from '@whatwg-node/fetch'
import appOrigin from '../appOrigin'
import ServerAuthToken from '../database/types/ServerAuthToken'
import encodeAuthToken from './encodeAuthToken'

// This is the function to call from every service that isn't running yoga
// If you want to call GraphQL from the yoga server, use callGQL
export const fetchGQL = async (query: string, variables?: Record<string, any>) => {
  const authToken = encodeAuthToken(new ServerAuthToken())
  const res = await fetch(`${appOrigin}/graphql`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({query, variables})
  })
  const json = await res.json()
  return json
}
