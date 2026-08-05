import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {SetSlackNotificationMutation as TSetSlackNotificationMutation} from '../__generated__/SetSlackNotificationMutation.graphql'
import type {
  SlackNotificationEventEnum,
  StageTimerModalEndTimeSlackToggle_teamMember$key
} from '../__generated__/StageTimerModalEndTimeSlackToggle_teamMember.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import NotificationErrorMessage from '../modules/notifications/components/NotificationErrorMessage'
import SetSlackNotificationMutation from '../mutations/SetSlackNotificationMutation'
import SlackClientManager from '../utils/SlackClientManager'
import Checkbox from './Checkbox'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  teamMember: StageTimerModalEndTimeSlackToggle_teamMember$key
}

const isNotificationActive = (integration: {
  isActive: boolean
  teamNotificationSettings: {events: readonly SlackNotificationEventEnum[]} | null | undefined
}) => {
  const {isActive, teamNotificationSettings} = integration
  if (!isActive || !teamNotificationSettings) return false
  const {events} = teamNotificationSettings
  if (!events) return false
  return (
    events.includes('MEETING_STAGE_TIME_LIMIT_START') ||
    events.includes('MEETING_STAGE_TIME_LIMIT_END')
  )
}

const StageTimerModalEndTimeSlackToggle = (props: Props) => {
  const {teamMember: teamMemberRef} = props
  const teamMember = useFragment(
    graphql`
      fragment StageTimerModalEndTimeSlackToggle_teamMember on TeamMember {
        teamId
        integrations {
          mattermost {
            isActive
            teamNotificationSettings {
              id
              events
            }
          }
          msTeams {
            isActive
            teamNotificationSettings {
              id
              events
            }
          }
          slack {
            isActive
            defaultTeamChannelId
            notifications {
              channelId
              event
            }
          }
        }
      }
    `,
    teamMemberRef
  )
  const {integrations, teamId} = teamMember
  const {mattermost, slack, msTeams} = integrations
  const notifications = slack?.notifications ?? []
  const timeLimitEvent = notifications.find(
    (notification) => notification.event === 'MEETING_STAGE_TIME_LIMIT_START'
  )
  const slackToggleActive = (timeLimitEvent && !!timeLimitEvent.channelId) || false
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()
  const {onError, onCompleted, submitMutation, error, submitting} = mutationProps
  const isMattermostActive = isNotificationActive(mattermost)
  const isMSTeamsActive = isNotificationActive(msTeams)
  const noActiveIntegrations = !slack?.isActive && !isMattermostActive && !isMSTeamsActive

  const onClick = () => {
    if (slack?.isActive) {
      if (submitting) return
      const {defaultTeamChannelId} = slack
      submitMutation()
      const variables = {
        slackChannelId: slackToggleActive ? null : defaultTeamChannelId,
        slackNotificationEvents: ['MEETING_STAGE_TIME_LIMIT_START'],
        teamId
      } as TSetSlackNotificationMutation['variables']
      SetSlackNotificationMutation(atmosphere, variables, {
        onError,
        onCompleted
      })
    } else {
      SlackClientManager.openOAuth(atmosphere, teamId, mutationProps)
    }
  }
  return (
    <div className='flex w-full flex-col'>
      {SlackClientManager.isAvailable && (slack?.isActive || noActiveIntegrations) && (
        <PlainButton className='flex w-full items-center justify-between' onClick={onClick}>
          <Checkbox
            className='mr-2 w-6 select-none text-center text-[18px]'
            active={slackToggleActive}
          />
          <div className='min-w-[160px] cursor-pointer select-none py-2 pl-2 text-[14px]'>
            {'Notify team via Slack'}
          </div>
        </PlainButton>
      )}
      {isMattermostActive && (
        <div className='select-none py-2 text-center text-[12px] italic'>
          {'Notifying via Mattermost'}
        </div>
      )}
      {isMSTeamsActive && (
        <div className='select-none py-2 text-center text-[12px] italic'>
          {'Notifying via MS Teams'}
        </div>
      )}
      <NotificationErrorMessage className='pb-2' error={error} />
    </div>
  )
}

export default StageTimerModalEndTimeSlackToggle
