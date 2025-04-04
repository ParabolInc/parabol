import graphql from 'babel-plugin-relay/macro'
import {getRequest} from 'relay-runtime'
import Atmosphere, {noopSink} from '../Atmosphere'

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
const request = getRequest(mutation).params
const {id, name} = request
const SetAppLocationMutation = (atmosphere: Atmosphere, variables: {location: string | null}) => {
  window.clearTimeout(timeout)
  timeout = window.setTimeout(() => {
    // if they just refresh or they lose connection, the subscriptionClient will be undefined
    atmosphere.subscriptionClient?.subscribe(
      {operationName: name, docId: id, query: '', variables} as any,
      noopSink
    )
  }, 200)
}

export default SetAppLocationMutation
