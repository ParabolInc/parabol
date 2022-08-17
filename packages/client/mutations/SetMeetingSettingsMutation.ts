import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {NewMeetingPhaseTypeEnum} from '~/__generated__/ActionMeeting_meeting.graphql'
import {StandardMutation} from '../types/relayMutations'
import {
  SetMeetingSettingsMutation as TSetMeetingSettingsMutation,
  SetMeetingSettingsMutationResponse
} from '../__generated__/SetMeetingSettingsMutation.graphql'

graphql`
  fragment SetMeetingSettingsMutation_team on SetMeetingSettingsPayload {
    settings {
      phaseTypes
      ... on RetrospectiveMeetingSettings {
        disableAnonymity
      }
    }
  }
`

const mutation = graphql`
  mutation SetMeetingSettingsMutation(
    $settingsId: ID!
    $checkinEnabled: Boolean
    $disableAnonymity: Boolean
  ) {
    setMeetingSettings(
      settingsId: $settingsId
      checkinEnabled: $checkinEnabled
      disableAnonymity: $disableAnonymity
    ) {
      ...SetMeetingSettingsMutation_team @relay(mask: false)
    }
  }
`

type Settings = NonNullable<SetMeetingSettingsMutationResponse['setMeetingSettings']['settings']>

const SetMeetingSettingsMutation: StandardMutation<TSetMeetingSettingsMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TSetMeetingSettingsMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {checkinEnabled, disableAnonymity, settingsId} = variables
      const settings = store.get<Settings>(settingsId)
      if (!settings) return

      // relay
      if (checkinEnabled !== undefined) {
        const phaseTypes = settings.getValue('phaseTypes').slice() as NewMeetingPhaseTypeEnum[]
        if (checkinEnabled && !phaseTypes.includes('checkin')) {
          phaseTypes.unshift('checkin')
        } else if (!checkinEnabled && phaseTypes.includes('checkin')) {
          phaseTypes.splice(
            phaseTypes.findIndex((type) => type === 'checkin'),
            1
          )
        }
        settings.setValue(phaseTypes, 'phaseTypes')
      }

      if (disableAnonymity !== undefined) {
        settings.setValue(disableAnonymity, 'disableAnonymity')
      }
    }
  })
}

export default SetMeetingSettingsMutation
