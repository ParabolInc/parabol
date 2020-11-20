import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {AddPokerTemplateScaleMutation_scale} from '../__generated__/AddPokerTemplateScaleMutation_scale.graphql'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {AddPokerTemplateScaleMutation as TAddPokerTemplateScaleMutation} from '../__generated__/AddPokerTemplateScaleMutation.graphql'
import handleAddPokerTemplateScale from './handlers/handleAddPokerTemplateScale'
import {PokerCards} from '../types/constEnums'

graphql`
  fragment AddPokerTemplateScaleMutation_scale on AddPokerTemplateScalePayload {
    scale {
      id
      name
      values {
        ...AddPokerTemplateScaleValue_scaleValues
      }
      teamId
    }
  }
`

const mutation = graphql`
  mutation AddPokerTemplateScaleMutation($parentScaleId: ID, $teamId: ID!) {
    addPokerTemplateScale(parentScaleId: $parentScaleId, teamId: $teamId) {
      ...AddPokerTemplateScaleMutation_scale @relay(mask: false)
    }
  }
`

export const addPokerTemplateScaleTeamUpdater: SharedUpdater<AddPokerTemplateScaleMutation_scale> = (
  payload,
  {store}
) => {
  const scale = payload.getLinkedRecord('scale')
  if (!scale) return
  const scaleId = scale.getValue('id')
  handleAddPokerTemplateScale(scale, store)
  const teamId = scale.getValue('teamId')
  const team = store.get(teamId)!
  team.setValue(scaleId, 'editingScaleId')
}

const AddPokerTemplateScaleMutation: StandardMutation<
  TAddPokerTemplateScaleMutation
> = (atmosphere, variables, {onError, onCompleted}) => {
  return commitMutation<TAddPokerTemplateScaleMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('addPokerTemplateScale')
      if (!payload) return
      addPokerTemplateScaleTeamUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {parentScaleId, teamId} = variables
      const team = store.get(teamId)!
      const parentScale = parentScaleId ? store.get(parentScaleId) : null
      const scaleName = parentScale ? parentScale.getValue('name') + ' Copy' : '*New Scale'
      const proxyScale = createProxyRecord(store, 'TemplateScale', {
        name: scaleName
      })
      proxyScale.setLinkedRecord(team, 'team')

      if (parentScale) {
        const currentScaleValues = parentScale.getLinkedRecords('values')!
        proxyScale.setLinkedRecords(currentScaleValues, 'values')
      } else {
        const questionMarkCard = createProxyRecord(store, 'TemplateScaleValue', {
          color: '#E55CA0',
          label: PokerCards.QUESTION_CARD,
          value: -1,
          isSpecial: true
        })
        const passCard = createProxyRecord(store, 'TemplateScaleValue', {
          color: '#AC72E5',
          label: PokerCards.PASS_CARD,
          value: Math.pow(2, 31) - 1,
          isSpecial: true
        })
        proxyScale.setLinkedRecords([questionMarkCard, passCard], 'values')
      }

      handleAddPokerTemplateScale(proxyScale, store)
    }
  })
}

export default AddPokerTemplateScaleMutation
