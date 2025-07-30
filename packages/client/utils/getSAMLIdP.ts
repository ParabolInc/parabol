import graphql from 'babel-plugin-relay/macro'
import type {getSAMLIdPQuery} from '../__generated__/getSAMLIdPQuery.graphql'
import type Atmosphere from '../Atmosphere'

const query = graphql`
  query getSAMLIdPQuery($email: ID!, $isInvited: Boolean) {
    SAMLIdP(email: $email, isInvited: $isInvited)
  }
`

const getSAMLIdP = async (atmosphere: Atmosphere, variables: getSAMLIdPQuery['variables']) => {
  const res = await atmosphere.fetchQuery<getSAMLIdPQuery>(query, variables, {
    fetchPolicy: 'network-only'
  })
  const safeRes = res instanceof Error ? undefined : res
  return safeRes?.SAMLIdP ?? null
}

export default getSAMLIdP
