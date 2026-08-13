import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import SetDefaultSlackChannelMutation from '~/mutations/SetDefaultSlackChannelMutation'
import type {
  SlackNotificationEventEnum,
  SlackNotificationList_viewer$key
} from '../../../../__generated__/SlackNotificationList_viewer.graphql'
import LabelHeading from '../../../../components/LabelHeading/LabelHeading'
import type {SlackChannelDropdownOnClick} from '../../../../components/SlackChannelDropdown'
import StyledError from '../../../../components/StyledError'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useEventCallback from '../../../../hooks/useEventCallback'
import useMutationProps from '../../../../hooks/useMutationProps'
import useSlackChannels from '../../../../hooks/useSlackChannels'
import SetSlackNotificationMutation from '../../../../mutations/SetSlackNotificationMutation'
import SlackChannelPicker from './SlackChannelPicker'
import SlackNotificationRow from './SlackNotificationRow'

interface Props {
  teamId: string
  viewer: SlackNotificationList_viewer$key
}

const TEAM_EVENTS = [
  'meetingStart',
  'meetingEnd',
  'MEETING_STAGE_TIME_LIMIT_START',
  'STANDUP_RESPONSE_SUBMITTED'
] as SlackNotificationEventEnum[]
const USER_EVENTS = ['MEETING_STAGE_TIME_LIMIT_END'] as SlackNotificationEventEnum[]

const SlackNotificationList = (props: Props) => {
  const {teamId, viewer: viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment SlackNotificationList_viewer on User {
        ...SlackNotificationRow_viewer
        teamMember(teamId: $teamId) {
          integrations {
            slack {
              botAccessToken
              isActive
              slackUserId
              defaultTeamChannelId
              notifications {
                channelId
                event
                eventType
              }
            }
          }
        }
      }
    `,
    viewerRef
  )
  const {teamMember} = viewer
  const {integrations} = teamMember!
  const {slack} = integrations
  const notifications = slack?.notifications ?? []
  const channels = useSlackChannels(slack)
  const {submitting, onError, onCompleted, submitMutation, error} = useMutationProps()
  const atmosphere = useAtmosphere()
  const localPrivateChannel = channels.find((channel) => channel.name === '@Parabol')
  const localPrivateChannelId = localPrivateChannel && localPrivateChannel.id
  const {isActive, defaultTeamChannelId} = slack!

  const changeTeamChannel: SlackChannelDropdownOnClick = useEventCallback(
    (slackChannelId) => () => {
      // only change the active events
      const slackNotificationEvents = notifications
        .filter((notification) => notification.channelId && notification.eventType === 'team')
        .map(({event}) => event)
      if (
        submitting ||
        defaultTeamChannelId === slackChannelId ||
        slackNotificationEvents.length === 0
      ) {
        return
      }
      submitMutation()
      SetDefaultSlackChannelMutation(
        atmosphere,
        {slackChannelId: slackChannelId!, teamId},
        {
          onError,
          onCompleted
        }
      )
      SetSlackNotificationMutation(
        atmosphere,
        {slackChannelId, slackNotificationEvents, teamId},
        {
          onError,
          onCompleted
        }
      )
    }
  )

  return (
    <div className='border-hairline border-t p-4'>
      <div className='flex items-center pb-4'>
        <LabelHeading className='w-full'>Team Notifications</LabelHeading>
        <SlackChannelPicker
          channels={channels}
          isTokenValid={isActive}
          localChannelId={defaultTeamChannelId}
          onClick={changeTeamChannel}
          teamId={teamId}
        />
      </div>
      {error && <StyledError>{error.message}</StyledError>}
      {TEAM_EVENTS.map((event) => {
        return (
          <SlackNotificationRow
            key={event}
            event={event}
            localChannelId={defaultTeamChannelId}
            teamId={teamId}
            viewer={viewer}
          />
        )
      })}
      <div className='flex items-center pt-8 pb-4'>
        <LabelHeading className='w-full'>Private Notifications</LabelHeading>
        {'@Parabol'}
      </div>
      {error && <StyledError>{error.message}</StyledError>}
      {localPrivateChannelId &&
        USER_EVENTS.map((event) => {
          return (
            <SlackNotificationRow
              key={event}
              event={event}
              localChannelId={localPrivateChannelId}
              teamId={teamId}
              viewer={viewer}
            />
          )
        })}
    </div>
  )
}

export default SlackNotificationList
