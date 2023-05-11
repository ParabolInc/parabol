import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {CreateGcalEventMutation as TCreateGcalEventMutation} from '../__generated__/CreateGcalEventMutation.graphql'

graphql`
  fragment CreateGcalEventMutation_meeting on CreateGcalEventSuccess {
    gcalLink
  }
`

const mutation = graphql`
  mutation CreateGcalEventMutation($input: CreateGcalEventInput!) {
    createGcalEvent(input: $input) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...CreateGcalEventMutation_meeting @relay(mask: false)
    }
  }
`

const CreateGcalEventMutation: StandardMutation<TCreateGcalEventMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TCreateGcalEventMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default CreateGcalEventMutation
