import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SimpleMutation} from '../types/relayMutations'
import {DragEstimatingTaskMutation as IDragEstimatingTaskMutation} from '../__generated__/DragEstimatingTaskMutation.graphql'

graphql`
  fragment DragEstimatingTaskMutation_meeting on DragEstimatingTaskSuccess {
    meeting {
      phases {
        stages {
          id
        }
      }
    }
  }
`

const mutation = graphql`
  mutation DragEstimatingTaskMutation($meetingId: ID!, $taskId: ID!, $newPositionIndex: Int!) {
    dragEstimatingTask(
      meetingId: $meetingId
      taskId: $taskId
      newPositionIndex: $newPositionIndex
    ) {
      ...DragEstimatingTaskMutation_meeting @relay(mask: false)
    }
  }
`

const DragEstimatingTaskMutation: SimpleMutation<IDragEstimatingTaskMutation> = (
  atmosphere,
  variables
) => {
  return commitMutation<IDragEstimatingTaskMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {meetingId, taskId, newPositionIndex} = variables
      const meeting = store.get(meetingId)
      if (!meeting) return
      const phases = meeting.getLinkedRecords('phases')!
      const phase = phases.find((phase) => phase.getValue('phaseType') === 'ESTIMATE')!
      const stages = phase.getLinkedRecords('stages')!
      const draggedStages = stages.filter((stage) => stage.getValue('taskId') === taskId)
      const remainingStages = stages.filter((stage) => stage.getValue('taskId') !== taskId)
      const taskIds = stages.map((stage) => stage.getValue('taskId'))
      const numberOfTasks = new Set(taskIds).size
      const numberOfDimensions = Math.floor(stages.length / numberOfTasks)
      const oldPositionIndex = taskIds.indexOf(taskId) / numberOfDimensions

      let newStages
      if (newPositionIndex === 0) {
        newStages = [...draggedStages, ...remainingStages]
      } else if (newPositionIndex === numberOfTasks - 1) {
        newStages = [...remainingStages, ...draggedStages]
      } else {
        if (oldPositionIndex > newPositionIndex) {
          const leftPart = stages.slice(0, newPositionIndex * numberOfDimensions)
          const rightPart = remainingStages.filter((stage) => !leftPart.includes(stage))
          newStages = [...leftPart, ...draggedStages, ...rightPart]
        } else {
          const rightPart = stages.slice((newPositionIndex + 1) * numberOfDimensions)
          const leftPart = remainingStages.filter((stage) => !rightPart.includes(stage))
          newStages = [...leftPart, ...draggedStages, ...rightPart]
        }
      }

      phase.setLinkedRecords(newStages, 'stages')
    }
  })
}

export default DragEstimatingTaskMutation
