import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import SetDefaultSlackChannelMutation from '~/mutations/SetDefaultSlackChannelMutation'
import LabelHeading from '../../../../components/LabelHeading/LabelHeading'
import {SlackChannelDropdownOnClick} from '../../../../components/SlackChannelDropdown'
import StyledError from '../../../../components/StyledError'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useEventCallback from '../../../../hooks/useEventCallback'
import useMutationProps from '../../../../hooks/useMutationProps'
import useSlackChannels from '../../../../hooks/useSlackChannels'
import SetSlackNotificationMutation from '../../../../mutations/SetSlackNotificationMutation'
import {PALETTE} from '../../../../styles/paletteV3'
import {Layout} from '../../../../types/constEnums'
import {
  SlackNotificationEventEnum,
  SlackNotificationList_viewer$key
} from '../../../../__generated__/SlackNotificationList_viewer.graphql'
import SlackChannelPicker from './SlackChannelPicker'
import SlackNotificationRow from './SlackNotificationRow'

const SlackNotificationListStyles = styled('div')({
  borderTop: `1px solid ${PALETTE.SLATE_300}`,
  padding: Layout.ROW_GUTTER
})

interface Props {
  teamId: string
  viewer: SlackNotificationList_viewer$key
}

const TeamGroup = styled('div')({
  alignItems: 'center',
  display: 'flex',
  paddingBottom: 16
})

const UserGroup = styled(TeamGroup)({
  paddingTop: 32
})

const Heading = styled(LabelHeading)({
  width: '100%'
})

const TEAM_EVENTS = [
  'meetingStart',
  'meetingEnd',
  'MEETING_STAGE_TIME_LIMIT_START'
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
    <SlackNotificationListStyles>
      <TeamGroup>
        <Heading>Team Notifications</Heading>
        <SlackChannelPicker
          channels={channels}
          isTokenValid={isActive}
          localChannelId={defaultTeamChannelId}
          onClick={changeTeamChannel}
          teamId={teamId}
        />
      </TeamGroup>
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
      <UserGroup>
        <Heading>Private Notifications</Heading>
        {'@Parabol'}
      </UserGroup>
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
    </SlackNotificationListStyles>
  )
}

export default SlackNotificationList
