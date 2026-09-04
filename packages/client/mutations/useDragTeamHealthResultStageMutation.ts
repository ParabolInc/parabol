import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useDragTeamHealthResultStageMutation as TDragTeamHealthResultStageMutation} from '../__generated__/useDragTeamHealthResultStageMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import handleUpdateStageSort from './handlers/handleUpdateStageSort'

// selected by both the mutation payload and MeetingSubscription so the store stays in sync. The
// server returns the stages in their new order, so no updater is needed outside the optimistic one
graphql`
  fragment useDragTeamHealthResultStageMutation_meeting on DragTeamHealthResultStageSuccess {
    meeting {
      id
      phases {
        id
        phaseType
        stages {
          id
          ... on TeamHealthResultStage {
            sortOrder
          }
        }
      }
    }
  }
`

const mutation = graphql`
  mutation useDragTeamHealthResultStageMutation(
    $meetingId: ID!
    $stageId: ID!
    $sortOrder: Float!
  ) {
    dragTeamHealthResultStage(meetingId: $meetingId, stageId: $stageId, sortOrder: $sortOrder) {
      ...useDragTeamHealthResultStageMutation_meeting @relay(mask: false)
    }
  }
`

const useDragTeamHealthResultStageMutation = () => {
  const [commit, submitting] = useMutation<TDragTeamHealthResultStageMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TDragTeamHealthResultStageMutation>) => {
    const {meetingId, stageId, sortOrder} = config.variables
    return commit({
      optimisticUpdater: (store) => {
        const stage = store.get(stageId)
        if (!stage) return
        stage.setValue(sortOrder, 'sortOrder')
        handleUpdateStageSort(store, meetingId, 'TEAM_HEALTH_RESULT')
      },
      ...config,
      onError: (error) => {
        atmosphere.eventEmitter.emit('addSnackbar', {
          message: error.message,
          autoDismiss: 5,
          key: 'dragTeamHealthResultStageError'
        })
        config.onError?.(error)
      }
    })
  }
  return [execute, submitting] as const
}

export default useDragTeamHealthResultStageMutation
