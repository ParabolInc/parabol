import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {
  SlackNotificationEventEnum,
  TeamHealthReminderPrompt_meeting$key
} from '~/__generated__/TeamHealthReminderPrompt_meeting.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import NotificationErrorMessage from '../../modules/notifications/components/NotificationErrorMessage'
import {Button} from '../../ui/Button/Button'
import SlackClientManager from '../../utils/SlackClientManager'
import MattermostSVG from '../MattermostSVG'
import MSTeamsSVG from '../MSTeamsSVG'
import SlackSVG from '../SlackSVG'

interface Props {
  meeting: TeamHealthReminderPrompt_meeting$key
}

// Mattermost and MS Teams have no per-user DM, so their reminder is the team channel post, which
// only fires for teams that subscribed a channel to meeting events. Slack DMs each member who has
// their own auth, and posts to the channel a member subscribed to meeting events
const isChannelReminderActive = (integration: {
  isActive: boolean
  teamNotificationSettings: {events: readonly SlackNotificationEventEnum[]} | null | undefined
}) => {
  const {isActive, teamNotificationSettings} = integration
  return !!isActive && !!teamNotificationSettings?.events.includes('meetingStart')
}

const TeamHealthReminderPrompt = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment TeamHealthReminderPrompt_meeting on TeamHealthMeeting {
        teamId
        meetingSeriesId
        scheduledEndTime
        viewerMeetingMember {
          teamMember {
            integrations {
              slack {
                isActive
                notifications {
                  event
                  channelId
                }
              }
              mattermost {
                isActive
                teamNotificationSettings {
                  events
                }
              }
              msTeams {
                isActive
                teamNotificationSettings {
                  events
                }
              }
            }
          }
          ... on TeamHealthMeetingMember {
            isSpectating
          }
        }
      }
    `,
    meetingRef
  )
  const {teamId, meetingSeriesId, scheduledEndTime, viewerMeetingMember} = meeting
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const mutationProps = useMutationProps()
  const {submitting, error} = mutationProps
  const integrations = viewerMeetingMember?.teamMember.integrations
  const slack = integrations?.slack
  const hasSlackChannel = !!slack?.notifications.some(
    ({event, channelId}) => event === 'meetingStart' && !!channelId
  )
  const hasChannelReminder =
    hasSlackChannel ||
    (!!integrations && isChannelReminderActive(integrations.mattermost)) ||
    (!!integrations && isChannelReminderActive(integrations.msTeams))
  // a spectator (usually the lead) is not nudged personally, so what they care about is the team
  const isSpectating = !!viewerMeetingMember?.isSpectating
  const hasReminder = isSpectating ? hasChannelReminder : !!slack?.isActive || hasChannelReminder
  const isWebhookAvailable = !window.__ACTION__.mattermostWebhookIntegrationDisabled
  const hasIntegration = SlackClientManager.isAvailable || isWebhookAvailable
  if (!meetingSeriesId || !scheduledEndTime || hasReminder || !hasIntegration) {
    return null
  }

  const onConnectSlack = () => {
    if (submitting) return
    SlackClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }
  const onConnectWebhook = () => navigate(`/team/${teamId}/integrations`)
  const buttonClassName = 'gap-2 [&_svg]:h-5 [&_svg]:w-5'

  return (
    <div className='mt-4 flex flex-col items-center gap-2 text-fg-muted text-sm'>
      <span>
        {isSpectating ? 'Remind your team before this closes' : 'Get a reminder before this closes'}
      </span>
      <div className='flex flex-wrap items-center justify-center gap-2'>
        {SlackClientManager.isAvailable && (
          <Button
            variant='outline'
            size='md'
            className={buttonClassName}
            disabled={submitting}
            onClick={onConnectSlack}
          >
            <SlackSVG />
            Slack
          </Button>
        )}
        {isWebhookAvailable && (
          <>
            <Button
              variant='outline'
              size='md'
              className={`${buttonClassName} [&_svg_path]:fill-current`}
              onClick={onConnectWebhook}
            >
              <MattermostSVG />
              Mattermost
            </Button>
            <Button
              variant='outline'
              size='md'
              className={buttonClassName}
              onClick={onConnectWebhook}
            >
              <MSTeamsSVG />
              Teams
            </Button>
          </>
        )}
      </div>
      <NotificationErrorMessage error={error} />
    </div>
  )
}

export default TeamHealthReminderPrompt
