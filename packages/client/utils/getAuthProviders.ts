import {getAuthProvidersQuery} from '../__generated__/getAuthProvidersQuery.graphql'
import {fetchQuery} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import Atmosphere from '../Atmosphere'

const query = graphql`
  query getAuthProvidersQuery($email: ID!) {
    authProviders(email: $email)
  }
`

const getAuthProviders = async (atmosphere: Atmosphere, email: string) => {
  let res
  try {
    res = await fetchQuery<getAuthProvidersQuery>(atmosphere, query, {email})
  } catch (e) {
    // server error, probably rate limited
    return []
  }
  return (res && res.authProviders) || []
}

export default getAuthProviders
