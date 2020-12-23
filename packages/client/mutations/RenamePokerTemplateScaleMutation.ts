import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Disposable} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import {CompletedHandler, ErrorHandler} from '../types/relayMutations'
import {IRenamePokerTemplateScaleOnMutationArguments} from '../types/graphql'

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

const RenamePokerTemplateScaleMutation = (
  atmosphere: Atmosphere,
  variables: IRenamePokerTemplateScaleOnMutationArguments,
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
      const {name, scaleId} = variables
      const scale = store.get(scaleId)
      if (!scale) return
      scale.setValue(name, 'name')
    }
  })
}

export default RenamePokerTemplateScaleMutation
