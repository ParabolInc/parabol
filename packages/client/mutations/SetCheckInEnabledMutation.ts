import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {StandardMutation} from '../types/relayMutations'
import {SetCheckInEnabledMutation as TSetCheckInEnabledMutation} from '../__generated__/SetCheckInEnabledMutation.graphql'
import {ITeamMeetingSettings, NewMeetingPhaseTypeEnum} from '../types/graphql'

graphql`
  fragment SetCheckInEnabledMutation_team on SetCheckInEnabledPayload {
    settings {
      phaseTypes
    }
  }
`

const mutation = graphql`
  mutation SetCheckInEnabledMutation($settingsId: ID!, $isEnabled: Boolean!) {
    setCheckInEnabled(settingsId: $settingsId, isEnabled: $isEnabled) {
      ...SetCheckInEnabledMutation_team @relay(mask: false)
    }
  }
`

const SetCheckInEnabledMutation: StandardMutation<TSetCheckInEnabledMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TSetCheckInEnabledMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {isEnabled, settingsId} = variables
      const settings = store.get<ITeamMeetingSettings>(settingsId)
      if (!settings) return
      // relay
      const phaseTypes = settings.getValue('phaseTypes').slice()
      if (isEnabled && !phaseTypes.includes(NewMeetingPhaseTypeEnum.checkin)) {
        phaseTypes.unshift(NewMeetingPhaseTypeEnum.checkin)
      } else if (!isEnabled && phaseTypes.includes(NewMeetingPhaseTypeEnum.checkin)) {
        phaseTypes.splice(
          phaseTypes.findIndex((type) => type === NewMeetingPhaseTypeEnum.checkin),
          1
        )
      }
      settings.setValue(phaseTypes, 'phaseTypes')
    }
  })
}

export default SetCheckInEnabledMutation
