import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import Atmosphere from '../Atmosphere'
import {ISetStageTimerOnMutationArguments} from '../types/graphql'
import {LocalHandlers} from '../types/relayMutations'
import {SetStageTimerMutation as TSetStageTimerMutation} from '../__generated__/SetStageTimerMutation.graphql'

graphql`
  fragment SetStageTimerMutation_team on SetStageTimerPayload {
    stage {
      isAsync
      scheduledEndTime
      timeRemaining
    }
  }
`

const mutation = graphql`
  mutation SetStageTimerMutation(
    $meetingId: ID!
    $scheduledEndTime: DateTime
    $timeRemaining: Float
  ) {
    setStageTimer(
      meetingId: $meetingId
      scheduledEndTime: $scheduledEndTime
      timeRemaining: $timeRemaining
    ) {
      error {
        message
      }
      ...SetStageTimerMutation_team @relay(mask: false)
    }
  }
`

const SetStageTimerMutation = (
  atmosphere: Atmosphere,
  variables: ISetStageTimerOnMutationArguments,
  {onError, onCompleted}: LocalHandlers
) => {
  return commitMutation<TSetStageTimerMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {meetingId, scheduledEndTime, timeRemaining} = variables
      const meeting = store.get(meetingId)
      if (!meeting) return
      const facilitatorStageId = meeting.getValue('facilitatorStageId')
      const stage = store.get(facilitatorStageId)
      if (!stage) return
      const endTime = scheduledEndTime ? scheduledEndTime.toJSON() : null
      const isAsync = scheduledEndTime ? !timeRemaining : null
      stage.setValue(endTime, 'scheduledEndTime')
      stage.setValue(timeRemaining, 'timeRemaining')
      stage.setValue(isAsync, 'isAsync')
    },
    onCompleted,
    onError
  })
}

export default SetStageTimerMutation
