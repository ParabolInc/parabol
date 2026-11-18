import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useUpdateRetroMeetingSettingsMutation as TUpdateRetroMeetingSettingsMutation} from '../__generated__/useUpdateRetroMeetingSettingsMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnError} from './handlers/snackOnError'

graphql`
  fragment useUpdateRetroMeetingSettingsMutation_payload on UpdateRetroMeetingSettingsPayload {
    meeting {
      id
      disableAnonymity
      phases {
        id
        phaseType
        stages {
          id
          isComplete
          isNavigable
          isNavigableByFacilitator
        }
      }
      ...useMeeting_meeting
      ...RetroMeetingSidebar_meeting
      ...MeetingControlBar_meeting
      ...RetroMeetingUpdates_meeting
      ...RetroMeetingSettings_meeting
    }
    meetingSettings {
      id
      phaseTypes
      disableAnonymity
    }
  }
`

const mutation = graphql`
  mutation useUpdateRetroMeetingSettingsMutation(
    $meetingId: ID!
    $checkinEnabled: Boolean
    $reviewPastTasksEnabled: Boolean
    $disableAnonymity: Boolean
  ) {
    updateRetroMeetingSettings(
      meetingId: $meetingId
      checkinEnabled: $checkinEnabled
      reviewPastTasksEnabled: $reviewPastTasksEnabled
      disableAnonymity: $disableAnonymity
    ) {
      ...useUpdateRetroMeetingSettingsMutation_payload @relay(mask: false)
    }
  }
`

const useUpdateRetroMeetingSettingsMutation = () => {
  const [commit, submitting] = useMutation<TUpdateRetroMeetingSettingsMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TUpdateRetroMeetingSettingsMutation>) => {
    return commit({
      onError: snackOnError(atmosphere, 'updateRetroMeetingSettingsError'),
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useUpdateRetroMeetingSettingsMutation
