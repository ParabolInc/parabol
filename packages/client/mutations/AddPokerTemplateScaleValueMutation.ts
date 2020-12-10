import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {AddPokerTemplateScaleValueMutation as TAddPokerTemplateScaleValueMutation} from '../__generated__/AddPokerTemplateScaleValueMutation.graphql'
import handleAddPokerTemplateScaleValue from './handlers/handleAddPokerTemplateScaleValue'

graphql`
  fragment AddPokerTemplateScaleValueMutation_scale on AddPokerTemplateScaleValuePayload {
    scale {
      id
      name
      values {
        label
        color
      }
      teamId
    }
  }
`

const mutation = graphql`
  mutation AddPokerTemplateScaleValueMutation($scaleId: ID!, $scaleValue: AddTemplateScaleInput!) {
    addPokerTemplateScaleValue(scaleId: $scaleId, scaleValue: $scaleValue) {
      ...AddPokerTemplateScaleValueMutation_scale @relay(mask: false)
    }
  }
`

const AddPokerTemplateScaleValueMutation: StandardMutation<
  TAddPokerTemplateScaleValueMutation
> = (atmosphere, variables, {onError, onCompleted}) => {
  return commitMutation<TAddPokerTemplateScaleValueMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {scaleValue} = variables
      const proxyTemplateScaleValue = createProxyRecord(store, 'TemplateScaleValue', scaleValue)
      handleAddPokerTemplateScaleValue(proxyTemplateScaleValue, store)
    }
  })
}

export default AddPokerTemplateScaleValueMutation
