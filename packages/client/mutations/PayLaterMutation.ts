import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'relay-runtime'
import {StandardMutation} from '../types/relayMutations'
import {PayLaterMutation as TPayLaterMutation} from '../__generated__/PayLaterMutation.graphql'

graphql`
  fragment PayLaterMutation_organization on PayLaterPayload {
    meeting {
      showConversionModal
    }
  }
`

const mutation = graphql`
  mutation PayLaterMutation($meetingId: ID!) {
    payLater(meetingId: $meetingId) {
      ...PayLaterMutation_organization @relay(mask: false)
      error {
        message
      }
    }
  }
`

const PayLaterMutation: StandardMutation<TPayLaterMutation> = (
  atmosphere,
  variables
) => {
  return commitMutation<TPayLaterMutation>(atmosphere, {
    mutation,
    variables,
  })
}


export default PayLaterMutation
