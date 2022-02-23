import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {DragEstimatingTaskMutation_meeting} from '~/__generated__/DragEstimatingTaskMutation_meeting.graphql'
import {SharedUpdater, SimpleMutation} from '../types/relayMutations'
import {DragEstimatingTaskMutation as IDragEstimatingTaskMutation} from '../__generated__/DragEstimatingTaskMutation.graphql'
import handleUpdateStageSort from './handlers/handleUpdateStageSort'

graphql`
  fragment DragEstimatingTaskMutation_meeting on DragEstimatingTaskSuccess {
    stages {
      id
      sortOrder
    }
    meetingId
  }
`

const mutation = graphql`
  mutation DragEstimatingTaskMutation($meetingId: ID!, $taskId: ID!, $sortOrder: Float!) {
    dragEstimatingTask(meetingId: $meetingId, taskId: $taskId, sortOrder: $sortOrder) {
      ...DragEstimatingTaskMutation_meeting @relay(mask: false)
    }
  }
`

export const dragEstimatingTaskMeetingUpdater: SharedUpdater<DragEstimatingTaskMutation_meeting> = (
  payload,
  {store}
) => {
  const meetingId = payload.getValue('meetingId')
  handleUpdateStageSort(store, meetingId, 'ESTIMATE')
}

const DragEstimatingTaskMutation: SimpleMutation<IDragEstimatingTaskMutation> = (
  atmosphere,
  variables
) => {
  return commitMutation<IDragEstimatingTaskMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('dragEstimatingTask')
      if (!payload) return
      dragEstimatingTaskMeetingUpdater(payload as any, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {meetingId, taskId, sortOrder} = variables
      const meeting = store.get(meetingId)
      if (!meeting) return
      const phases = meeting.getLinkedRecords('phases')!
      const phase = phases.find((phase) => phase.getValue('phaseType') === 'ESTIMATE')!
      const stages = phase.getLinkedRecords('stages')!.filter((stage) => stage.getValue('taskId') === taskId)
      stages.forEach((stage, i) => { stage.setValue(sortOrder + i, 'sortOrder') })
      handleUpdateStageSort(store, meetingId, 'ESTIMATE')
    }
  })
}

export default DragEstimatingTaskMutation
