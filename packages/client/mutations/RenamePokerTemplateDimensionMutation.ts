import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {RenamePokerTemplateDimensionMutation as TRenamePokerTemplateDimensionMutation} from '~/__generated__/RenamePokerTemplateDimensionMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

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

const RenamePokerTemplateDimensionMutation: StandardMutation<
  TRenamePokerTemplateDimensionMutation
> = (atmosphere, variables, {onError, onCompleted}) => {
  return commitMutation<TRenamePokerTemplateDimensionMutation>(atmosphere, {
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
