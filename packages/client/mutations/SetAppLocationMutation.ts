import graphql from 'babel-plugin-relay/macro'
import Atmosphere from '../Atmosphere'

graphql`
  fragment SetAppLocationMutation_team on SetAppLocationSuccess {
    user {
      id
      lastSeenAtURLs
    }
  }
`

const mutation = graphql`
  mutation SetAppLocationMutation($location: String) {
    setAppLocation(location: $location) {
      ... on ErrorPayload {
        error {
          message
        }
      }
    }
  }
`

let timeout: number | undefined
const SetAppLocationMutation = (atmosphere: Atmosphere, variables: {location: string | null}) => {
  window.clearTimeout(timeout)
  timeout = window.setTimeout(() => {
    // TODO server ddon't respond
    atmosphere.fetchQuery(mutation, variables)
  }, 200)
}

export default SetAppLocationMutation
