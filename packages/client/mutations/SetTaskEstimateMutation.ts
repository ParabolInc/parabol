import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {BaseLocalHandlers, StandardMutation} from '../types/relayMutations'
import {SetTaskEstimateMutation as TSetTaskEstimateMutation} from '../__generated__/SetTaskEstimateMutation.graphql'
import SendClientSegmentEventMutation from './SendClientSegmentEventMutation'

graphql`
  fragment SetTaskEstimateMutation_meeting on SetTaskEstimateSuccess {
    stage {
      finalScore
    }
  }
`

const mutation = graphql`
  mutation SetTaskEstimateMutation($taskEstimate: TaskEstimateInput!) {
    setTaskEstimate(taskEstimate: $taskEstimate) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...SetTaskEstimateMutation_meeting @relay(mask: false)
    }
  }
`

interface Handlers extends BaseLocalHandlers {
  stageId: string
}
const SetTaskEstimateMutation: StandardMutation<TSetTaskEstimateMutation, Handlers> = (
  atmosphere,
  variables,
  {onError, onCompleted, stageId}
) => {
  const {taskEstimate} = variables
  const {taskId, meetingId, dimensionName} = taskEstimate

  return commitMutation<TSetTaskEstimateMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {taskEstimate} = variables
      const {value} = taskEstimate
      const stage = store.get(stageId)
      stage?.setValue(value, 'finalScore')
    },
    onCompleted: (data, errors) => {
      if (onCompleted) {
        onCompleted(data, errors)
      }
      console.log(`onCompleted`)
      SendClientSegmentEventMutation(atmosphere, 'Task Estimate Set', {
        meetingId,
        taskId,
        dimensionName,
        errorMessage: data.setTaskEstimate.error?.message,
        success: !data.setTaskEstimate.error
      })
    },
    onError
  })
}

export default SetTaskEstimateMutation
