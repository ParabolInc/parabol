import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {SetMeetingSettingsMutation as TSetMeetingSettingsMutation} from '../__generated__/SetMeetingSettingsMutation.graphql'

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

type Settings = NonNullable<
  TSetMeetingSettingsMutation['response']['setMeetingSettings']['settings']
>

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

      if (checkinEnabled !== undefined) {
        const phaseTypes = settings.getValue('phaseTypes')
        if (checkinEnabled && !phaseTypes.includes('checkin')) {
          settings.setValue(['checkin', ...phaseTypes], 'phaseTypes')
        } else if (!checkinEnabled && phaseTypes.includes('checkin')) {
          settings.setValue(
            phaseTypes.filter((type) => type !== 'checkin'),
            'phaseTypes'
          )
        }
      }

      if (disableAnonymity !== undefined) {
        settings.setValue(disableAnonymity, 'disableAnonymity')
      }
    }
  })
}

export default SetMeetingSettingsMutation
