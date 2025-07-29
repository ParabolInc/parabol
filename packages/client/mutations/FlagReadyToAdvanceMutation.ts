import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {FlagReadyToAdvanceMutation as TFlagReadyToAdvanceMutation} from '../__generated__/FlagReadyToAdvanceMutation.graphql'
import type {SimpleMutation} from '../types/relayMutations'

graphql`
  fragment FlagReadyToAdvanceMutation_meeting on FlagReadyToAdvanceSuccess {
    stage {
      isViewerReady
      readyUserIds
    }
  }
`

const mutation = graphql`
  mutation FlagReadyToAdvanceMutation($stageId: ID!, $meetingId: ID!, $isReady: Boolean!) {
    flagReadyToAdvance(stageId: $stageId, meetingId: $meetingId, isReady: $isReady) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...FlagReadyToAdvanceMutation_meeting @relay(mask: false)
    }
  }
`

type Stage = NonNullable<
  NonNullable<TFlagReadyToAdvanceMutation['response']['flagReadyToAdvance']>['stage']
>

const FlagReadyToAdvanceMutation: SimpleMutation<TFlagReadyToAdvanceMutation> = (
  atmosphere,
  variables
) => {
  return commitMutation<TFlagReadyToAdvanceMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {stageId, isReady} = variables
      const stage = store.get<Stage>(stageId)
      const viewer = store.getRoot().getLinkedRecord('viewer')
      if (!stage || !viewer) return
      const viewerId = viewer.getDataID()
      const readyUserIds = stage.getValue('readyUserIds') ?? []
      const nextReadyUserIds = isReady
        ? [...readyUserIds, viewerId]
        : readyUserIds.filter((userId) => userId !== viewerId)
      stage.setValue(nextReadyUserIds, 'readyUserIds')
      stage.setValue(isReady, 'isReady')
    }
  })
}

export default FlagReadyToAdvanceMutation
