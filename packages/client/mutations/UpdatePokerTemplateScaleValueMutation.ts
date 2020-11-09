import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Disposable} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import {CompletedHandler, ErrorHandler} from '../types/relayMutations'
import {IUpdatePokerTemplateScaleValueOnMutationArguments} from '../types/graphql'
import safeRemoveNodeFromArray from '~/utils/relay/safeRemoveNodeFromArray'
import createProxyRecord from '~/utils/relay/createProxyRecord'
import addNodeToArray from '~/utils/relay/addNodeToArray'

graphql`
  fragment UpdatePokerTemplateScaleValueMutation_scale on UpdatePokerTemplateScaleValuePayload {
    scale {
      id
      name
      values {
        label
        value
        color
        isSpecial
      }
    }
  }
`

const mutation = graphql`
  mutation UpdatePokerTemplateScaleValueMutation($scaleId: ID!, $oldScaleValue: TemplateScaleInput!, $newScaleValue: TemplateScaleInput!) {
    updatePokerTemplateScaleValue(scaleId: $scaleId, oldScaleValue: $oldScaleValue, newScaleValue: $newScaleValue) {
      error {
        message
      }
      ...UpdatePokerTemplateScaleValueMutation_scale @relay(mask: false)
    }
  }
`

const UpdatePokerTemplateScaleValueMutation = (
  atmosphere: Atmosphere,
  variables: IUpdatePokerTemplateScaleValueOnMutationArguments,
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
      const {scaleId, oldScaleValue, newScaleValue} = variables
      const scale = store.get(scaleId)
      if (!scale) return
      const oldScaleValueId = `${scaleId}:${oldScaleValue.value}`
      safeRemoveNodeFromArray(oldScaleValueId, scale, 'values')

      const proxyScaleValue = createProxyRecord(store, 'TemplateScaleValue', {...newScaleValue})
      addNodeToArray(proxyScaleValue, scale, 'values', 'value')
    }
  })
}

export default UpdatePokerTemplateScaleValueMutation
