import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {RenamePokerTemplateScaleMutation as TRenamePokerTemplateScaleMutation} from '~/__generated__/RenamePokerTemplateScaleMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment RenamePokerTemplateScaleMutation_scale on RenamePokerTemplateScalePayload {
    scale {
      name
    }
  }
`

const mutation = graphql`
  mutation RenamePokerTemplateScaleMutation($scaleId: ID!, $name: String!) {
    renamePokerTemplateScale(scaleId: $scaleId, name: $name) {
      ...RenamePokerTemplateScaleMutation_scale @relay(mask: false)
    }
  }
`

const RenamePokerTemplateScaleMutation: StandardMutation<TRenamePokerTemplateScaleMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TRenamePokerTemplateScaleMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {name, scaleId} = variables
      const scale = store.get(scaleId)
      if (!scale) return
      scale.setValue(name, 'name')
    }
  })
}

export default RenamePokerTemplateScaleMutation
