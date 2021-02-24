import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {SlackNotificationEventEnum, SlackNotificationEventTypeEnum} from '../../../../types/graphql'
import SlackNotificationRow from './SlackNotificationRow'
import {SlackNotificationList_viewer} from '../../../../__generated__/SlackNotificationList_viewer.graphql'
import React from 'react'
import {SlackChannelDropdownOnClick} from '../../../../components/SlackChannelDropdown'
import LabelHeading from '../../../../components/LabelHeading/LabelHeading'
import SlackChannelPicker from './SlackChannelPicker'
import useMutationProps from '../../../../hooks/useMutationProps'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import SetSlackNotificationMutation from '../../../../mutations/SetSlackNotificationMutation'
import useSlackChannels from '../../../../hooks/useSlackChannels'
import StyledError from '../../../../components/StyledError'
import {PALETTE} from '../../../../styles/paletteV2'
import {Layout} from '../../../../types/constEnums'
import useEventCallback from '../../../../hooks/useEventCallback'
import SetDefaultSlackChannelMutation from '~/mutations/SetDefaultSlackChannelMutation'

const SlackNotificationListStyles = styled('div')({
  borderTop: `1px solid ${PALETTE.BORDER_LIGHTER}`,
  padding: Layout.ROW_GUTTER
})

interface Props {
  teamId: string
  viewer: SlackNotificationList_viewer
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
  SlackNotificationEventEnum.meetingStart,
  SlackNotificationEventEnum.meetingEnd,
  SlackNotificationEventEnum.MEETING_STAGE_TIME_LIMIT_START
]
const USER_EVENTS = [SlackNotificationEventEnum.MEETING_STAGE_TIME_LIMIT_END]

const SlackNotificationList = (props: Props) => {
  const {teamId, viewer} = props
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
        .filter(
          (notification) =>
            notification.channelId && notification.eventType === SlackNotificationEventTypeEnum.team
        )
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
        {slackChannelId, teamId},
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
      {error && <StyledError>{error}</StyledError>}
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
      {error && <StyledError>{error}</StyledError>}
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

export default createFragmentContainer(SlackNotificationList, {
  viewer: graphql`
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
  `
})
