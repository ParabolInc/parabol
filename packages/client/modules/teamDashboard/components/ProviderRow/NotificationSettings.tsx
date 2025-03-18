import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {
  NotificationSettings_settings$key,
  SlackNotificationEventEnum
} from '../../../../__generated__/NotificationSettings_settings.graphql'
import StyledError from '../../../../components/StyledError'
import Toggle from '../../../../components/Toggle/Toggle'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import SetTeamNotificationSettingMutation from '../../../../mutations/SetTeamNotificationSettingMutation'
import {MeetingLabels} from '../../../../types/constEnums'

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
  settings: NotificationSettings_settings$key
}

const NotificationSettings = (props: Props) => {
  const {settings: settingsRef} = props
  const settings = useFragment(
    graphql`
      fragment NotificationSettings_settings on TeamNotificationSettings {
        id
        events
      }
    `,
    settingsRef
  )
  const {events} = settings

  const atmosphere = useAtmosphere()
  const {submitting, onError, onCompleted, submitMutation, error} = useMutationProps()
  const setNotificationSetting = (event: SlackNotificationEventEnum, isEnabled: boolean) => {
    if (submitting) {
      return
    }
    submitMutation()
    SetTeamNotificationSettingMutation(
      atmosphere,
      {
        id: settings.id,
        event,
        isEnabled
      },
      {
        onError,
        onCompleted
      }
    )
  }

  return (
    <div>
      {error && <StyledError>{error.message}</StyledError>}
      {EVENTS.map((event) => {
        const label = labelLookup[event]
        const active = events.includes(event)
        return (
          <div className='flex items-center py-2'>
            <div className='mr-4 w-full text-sm'>{label}</div>
            <Toggle active={active} onClick={() => setNotificationSetting(event, !active)} />
          </div>
        )
      })}
    </div>
  )
}

export default NotificationSettings
