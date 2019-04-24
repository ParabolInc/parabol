import {graphql} from 'react-relay'
import {getRequest} from 'relay-runtime'
import Atmosphere from 'universal/Atmosphere'

const query = graphql`
  query getAuthProvidersQuery($email: ID!) {
    authProviders(email: $email)
  }
`

const getAuthProviders = async (atmosphere: Atmosphere, email: string) => {
  const network = atmosphere.getNetwork()
  const observable = network.execute(getRequest(query).params, {email}, {force: true}, undefined)
  const res = await observable.toPromise()
  return (res && res.data && res.data.authProviders) || []
}

export default getAuthProviders
