import graphql from 'babel-plugin-relay/macro'
import Toggle from 'parabol-client/components/Toggle/Toggle'
import {MeetingLabels} from 'parabol-client/types/constEnums'
import {useFragment, useMutation} from 'react-relay'
import {
  NotificationSettings_teamSettings$key,
  SlackNotificationEventEnum
} from '../../__generated__/NotificationSettings_teamSettings.graphql'
import {NotificationSettingsMutation} from '../../__generated__/NotificationSettingsMutation.graphql'

const EVENTS = [
  'meetingStart',
  'meetingEnd',
  'MEETING_STAGE_TIME_LIMIT_START',
  'MEETING_STAGE_TIME_LIMIT_END'
  //TODO these are not implemented yet:
  //'STANDUP_RESPONSE_SUBMITTED',
  //'TOPIC_SHARED',
] as SlackNotificationEventEnum[]

const labelLookup = {
  meetingEnd: 'Meeting End',
  meetingStart: 'Meeting Start',
  MEETING_STAGE_TIME_LIMIT_END: `Meeting ${MeetingLabels.TIME_LIMIT} Ended`,
  MEETING_STAGE_TIME_LIMIT_START: `Meeting ${MeetingLabels.TIME_LIMIT} Started`,
  TOPIC_SHARED: `Topic Shared`,
  STANDUP_RESPONSE_SUBMITTED: 'Standup Response Submitted'
} as Record<SlackNotificationEventEnum, string>

interface Props {
  settings: NotificationSettings_teamSettings$key
}

const NotificationSettings = (props: Props) => {
  const {settings: settingsRef} = props
  const settings = useFragment(
    graphql`
      fragment NotificationSettings_teamSettings on TeamNotificationSettings {
        id
        events
      }
    `,
    settingsRef
  )
  const {events} = settings

  const [updateSettings, isUpdating] = useMutation<NotificationSettingsMutation>(graphql`
    mutation NotificationSettingsMutation(
      $id: ID!
      $event: SlackNotificationEventEnum!
      $isEnabled: Boolean!
    ) {
      setTeamNotificationSetting(id: $id, event: $event, isEnabled: $isEnabled) {
        ... on ErrorPayload {
          error {
            message
          }
        }
        ... on SetTeamNotificationSettingSuccess {
          teamNotificationSettings {
            ...NotificationSettings_teamSettings
          }
        }
      }
    }
  `)
  const setNotificationSetting = (event: SlackNotificationEventEnum, isEnabled: boolean) => {
    if (isUpdating) {
      return
    }
    updateSettings({
      variables: {
        id: settings.id,
        event,
        isEnabled
      }
    })
  }

  return (
    <div className='px-1'>
      {EVENTS.map((event) => {
        const label = labelLookup[event]
        const active = events.includes(event)
        return (
          <div className='flex items-center py-2'>
            <div className='mr-4 w-full'>{label}</div>
            <Toggle active={active} onClick={() => setNotificationSetting(event, !active)} />
          </div>
        )
      })}
    </div>
  )
}

export default NotificationSettings
