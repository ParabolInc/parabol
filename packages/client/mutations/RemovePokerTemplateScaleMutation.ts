import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {RemovePokerTemplateScaleMutation as IRemovePokerTemplateScaleMutation} from '../__generated__/RemovePokerTemplateScaleMutation.graphql'
import {SprintPokerDefaults} from '../types/constEnums'
import type {StandardMutation} from '../types/relayMutations'
import safeRemoveNodeFromArray from '../utils/relay/safeRemoveNodeFromArray'

graphql`
  fragment RemovePokerTemplateScaleMutation_team on RemovePokerTemplateScalePayload {
    team {
      scales {
        ...ScaleDropdownMenuItem_scale
        id
        teamId
        dimensions {
          ...PokerTemplateScalePicker_dimension
        }
      }
    }
  }
`

const mutation = graphql`
  mutation RemovePokerTemplateScaleMutation($scaleId: ID!) {
    removePokerTemplateScale(scaleId: $scaleId) {
      ...RemovePokerTemplateScaleMutation_team @relay(mask: false)
    }
  }
`

const RemovePokerTemplateScaleMutation: StandardMutation<IRemovePokerTemplateScaleMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<IRemovePokerTemplateScaleMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {scaleId} = variables
      const scale = store.get(scaleId)
      if (!scale) return
      const teamId = scale.getValue('teamId') as string
      if (!teamId) return
      const team = store.get(teamId)!
      safeRemoveNodeFromArray(scaleId, team, 'scales')
      const dimensionsUsingScale = scale.getLinkedRecords('dimensions')
      const defaultScale = store.get(SprintPokerDefaults.DEFAULT_SCALE_ID)
      if (!defaultScale) return
      dimensionsUsingScale?.forEach((dimension) => {
        dimension.setLinkedRecord(defaultScale, 'selectedScale')
      })
    }
  })
}

export default RemovePokerTemplateScaleMutation
