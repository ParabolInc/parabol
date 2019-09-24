import graphql from 'babel-plugin-relay/macro'
import {getRequest} from 'relay-runtime'
import Atmosphere from '../Atmosphere'

const mutation = graphql`
  mutation PayLaterMutation($orgId: ID!) {
    payLater(orgId: $orgId) {
      error {
        message
      }
    }
  }
`

const PayLaterMutation = (atmosphere: Atmosphere, variables: {orgId: string}) => {
  const {_network: network} = atmosphere
  network.execute(getRequest(mutation).params, variables, {force: true})
}

export default PayLaterMutation
