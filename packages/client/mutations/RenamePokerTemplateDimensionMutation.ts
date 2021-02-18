import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Disposable} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import {CompletedHandler, ErrorHandler} from '../types/relayMutations'
import {RenamePokerTemplateDimensionMutationVariables} from '~/__generated__/RenamePokerTemplateDimensionMutation.graphql'

graphql`
  fragment RenamePokerTemplateDimensionMutation_dimension on RenamePokerTemplateDimensionPayload {
    dimension {
      name
    }
  }
`

const mutation = graphql`
  mutation RenamePokerTemplateDimensionMutation($dimensionId: ID!, $name: String!) {
    renamePokerTemplateDimension(dimensionId: $dimensionId, name: $name) {
      error {
        message
      }
      ...RenamePokerTemplateDimensionMutation_dimension @relay(mask: false)
    }
  }
`

const RenamePokerTemplateDimensionMutation = (
  atmosphere: Atmosphere,
  variables: RenamePokerTemplateDimensionMutationVariables,
  _context: {},
  onError: ErrorHandler,
  onCompleted: CompletedHandler
): Disposable => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {name, dimensionId} = variables
      const dimension = store.get(dimensionId)
      if (!dimension) return
      dimension.setValue(name, 'name')
    }
  })
}

export default RenamePokerTemplateDimensionMutation
