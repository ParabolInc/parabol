import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useSetMeetingSettingsMutation as TSetMeetingSettingsMutation} from '../__generated__/useSetMeetingSettingsMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnError} from './handlers/snackOnError'

graphql`
  fragment useSetMeetingSettingsMutation_payload on SetMeetingSettingsPayload {
    settings {
      id
      phaseTypes
      ... on RetrospectiveMeetingSettings {
        disableAnonymity
      }
    }
    meeting {
      ... on RetrospectiveMeeting {
        id
        disableAnonymity
        templateId
        template {
          id
          name
        }
        meetingSeries {
          id
          templateId
          template {
            id
            name
          }
        }
        phases {
          id
          phaseType
          stages {
            id
            isComplete
            isNavigable
            isNavigableByFacilitator
          }
          ... on ReflectPhase {
            reflectPrompts {
              ...PhaseItemColumn_prompt @relay(mask: false)
              ...GroupingKanbanColumn_prompt @relay(mask: false)
              id
              sortOrder
            }
          }
        }
        ...useMeeting_meeting
        ...RetroMeetingSidebar_meeting
        ...MeetingControlBar_meeting
        ...RetroMeetingUpdates_meeting
        ...RetroMeetingSettings_meeting
      }
      ... on TeamPromptMeeting {
        id
        meetingSeries {
          id
          templateId
        }
        ...TeamPromptStructuredMeeting_meeting
      }
    }
  }
`

const mutation = graphql`
  mutation useSetMeetingSettingsMutation(
    $settingsId: ID!
    $meetingId: ID
    $templateId: ID
    $clearTeamPromptResponses: Boolean
    $checkinEnabled: Boolean
    $reviewPastTasksEnabled: Boolean
    $disableAnonymity: Boolean
  ) {
    setMeetingSettings(
      settingsId: $settingsId
      meetingId: $meetingId
      templateId: $templateId
      clearTeamPromptResponses: $clearTeamPromptResponses
      checkinEnabled: $checkinEnabled
      reviewPastTasksEnabled: $reviewPastTasksEnabled
      disableAnonymity: $disableAnonymity
    ) {
      ...useSetMeetingSettingsMutation_payload @relay(mask: false)
    }
  }
`

const useSetMeetingSettingsMutation = () => {
  const [commit, submitting] = useMutation<TSetMeetingSettingsMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TSetMeetingSettingsMutation>) => {
    return commit({
      onError: snackOnError(atmosphere, 'setMeetingSettingsError'),
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useSetMeetingSettingsMutation
