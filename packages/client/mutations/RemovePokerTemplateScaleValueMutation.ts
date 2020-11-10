import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Disposable} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import {CompletedHandler, ErrorHandler} from '../types/relayMutations'
import {IRemovePokerTemplateScaleValueOnMutationArguments} from '../types/graphql'
import {RemovePokerTemplateScaleValueMutation as IRemovePokerTemplateScaleValueMutation} from '../__generated__/RemovePokerTemplateScaleValueMutation.graphql'
import safeRemoveNodeFromArray from '~/utils/relay/safeRemoveNodeFromArray'

graphql`
  fragment RemovePokerTemplateScaleValueMutation_scale on RemovePokerTemplateScaleValuePayload {
    scale {
      ...TemplateScaleValueItem_scale
    }
  }
`

const mutation = graphql`
  mutation RemovePokerTemplateScaleValueMutation($scaleId: ID!, $scaleValue: Float!) {
    removePokerTemplateScaleValue(scaleId: $scaleId, scaleValue: $scaleValue) {
      ...RemovePokerTemplateScaleValueMutation_scale @relay(mask: false)
    }
  }
`

const RemovePokerTemplateScaleValueMutation = (
  atmosphere: Atmosphere,
  variables: IRemovePokerTemplateScaleValueOnMutationArguments,
  _context: {},
  onError: ErrorHandler,
  onCompleted: CompletedHandler
): Disposable => {
  return commitMutation<IRemovePokerTemplateScaleValueMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {scaleId, scaleValue} = variables
      const scale = store.get(scaleId)
      if (!scale) return
      const scaleValueId = `${scale.getDataID()}:${scaleValue}`
      safeRemoveNodeFromArray(scaleValueId, scale, 'values')
    }
  })
}

export default RemovePokerTemplateScaleValueMutation
