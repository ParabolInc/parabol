import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {SetMeetingSettingsMutation as TSetMeetingSettingsMutation} from '../__generated__/SetMeetingSettingsMutation.graphql'
import type {StandardMutation} from '../types/relayMutations'

graphql`
  fragment SetMeetingSettingsMutation_team on SetMeetingSettingsPayload {
    settings {
      phaseTypes
      ... on RetrospectiveMeetingSettings {
        disableAnonymity
        videoMeetingURL
      }

    }
  }
`

const mutation = graphql`
  mutation SetMeetingSettingsMutation(
    $settingsId: ID!
    $checkinEnabled: Boolean
    $teamHealthEnabled: Boolean
    $reviewPastTasksEnabled: Boolean
    $disableAnonymity: Boolean
    $videoMeetingURL: String
  ) {
    setMeetingSettings(
      settingsId: $settingsId
      checkinEnabled: $checkinEnabled
      teamHealthEnabled: $teamHealthEnabled
      reviewPastTasksEnabled: $reviewPastTasksEnabled
      disableAnonymity: $disableAnonymity
      videoMeetingURL: $videoMeetingURL
    ) {
      ...SetMeetingSettingsMutation_team @relay(mask: false)
    }
  }
`

type Settings = NonNullable<
  TSetMeetingSettingsMutation['response']['setMeetingSettings']['settings']
>

// Inserts `'updates'` into a phaseTypes array immediately after the last index of
// 'checkin' / 'TEAM_HEALTH' (or at index 0 if neither present). Mirrors the server's
// canonicalization in setMeetingSettings.ts so the optimistic UI matches the post-write state.
const insertUpdatesAfterAnchor = (phaseTypes: readonly string[]): string[] => {
  if (phaseTypes.includes('updates')) return [...phaseTypes]
  let anchor = -1
  phaseTypes.forEach((phase, idx) => {
    if (phase === 'checkin' || phase === 'TEAM_HEALTH') anchor = idx
  })
  const insertAt = anchor + 1
  return [...phaseTypes.slice(0, insertAt), 'updates', ...phaseTypes.slice(insertAt)]
}

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
      const {checkinEnabled, reviewPastTasksEnabled, disableAnonymity, settingsId} = variables
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

      if (reviewPastTasksEnabled !== undefined) {
        const phaseTypes = settings.getValue('phaseTypes')
        if (reviewPastTasksEnabled && !phaseTypes.includes('updates')) {
          settings.setValue(insertUpdatesAfterAnchor(phaseTypes), 'phaseTypes')
        } else if (!reviewPastTasksEnabled && phaseTypes.includes('updates')) {
          settings.setValue(
            phaseTypes.filter((type) => type !== 'updates'),
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
