import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import Atmosphere from '../Atmosphere'
import {INewMeeting, INewMeetingStage, ISetStageTimerOnMutationArguments} from '../types/graphql'
import {LocalHandlers, SharedUpdater} from '../types/relayMutations'
import {SetStageTimerMutation as TSetStageTimerMutation} from '../__generated__/SetStageTimerMutation.graphql'
import {SetStageTimerMutation_team} from '__generated__/SetStageTimerMutation_team.graphql'
import LocalTimeHandler from '../utils/relay/LocalTimeHandler'

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

export const setStageTimerTeamUpdater: SharedUpdater<SetStageTimerMutation_team> = (
  payload,
  {store}
) => {
  const stage = payload.getLinkedRecord('stage')
  if (!stage) return

  LocalTimeHandler.update(store, {
    dataID: stage.getDataID(),
    fieldKey: 'scheduledEndTime',
    args: {},
    handle: '',
    handleKey: ''
  })
}

const SetStageTimerMutation = (
  atmosphere: Atmosphere,
  variables: ISetStageTimerOnMutationArguments,
  {onError, onCompleted}: LocalHandlers
) => {
  return commitMutation<TSetStageTimerMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('setStageTimer')
      setStageTimerTeamUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {meetingId, scheduledEndTime, timeRemaining} = variables
      const meeting = store.get<INewMeeting>(meetingId)
      if (!meeting) return
      const facilitatorStageId = meeting.getValue('facilitatorStageId')!
      const stage = store.get<INewMeetingStage>(facilitatorStageId)
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
