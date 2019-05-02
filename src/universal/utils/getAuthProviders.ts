import {getAuthProvidersQuery} from '__generated__/getAuthProvidersQuery.graphql'
import {fetchQuery, graphql} from 'react-relay'
import Atmosphere from 'universal/Atmosphere'

const query = graphql`
  query getAuthProvidersQuery($email: ID!) {
    authProviders(email: $email)
  }
`

const getAuthProviders = async (atmosphere: Atmosphere, email: string) => {
  const res = await fetchQuery<getAuthProvidersQuery>(atmosphere, query, {email})
  return (res && res.authProviders) || []
}

export default getAuthProviders
