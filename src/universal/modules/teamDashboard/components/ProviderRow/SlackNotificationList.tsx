import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import {SlackNotificationEventEnum, SlackNotificationEventTypeEnum} from 'universal/types/graphql'
import SlackNotificationRow from 'universal/modules/teamDashboard/components/ProviderRow/SlackNotificationRow'
import {SlackNotificationList_viewer} from '__generated__/SlackNotificationList_viewer.graphql'
import React, {useCallback} from 'react'
import {SlackChannelDropdownOnClick} from 'universal/components/SlackChannelDropdown'
import LabelHeading from 'universal/components/LabelHeading/LabelHeading'
import SlackChannelPicker from 'universal/modules/teamDashboard/components/ProviderRow/SlackChannelPicker'
import useMutationProps from 'universal/hooks/useMutationProps'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import SetSlackNotificationMutation from 'universal/mutations/SetSlackNotificationMutation'
import useSlackChannels from 'universal/hooks/useSlackChannels'
import StyledError from 'universal/components/StyledError'
import {PALETTE} from 'universal/styles/paletteV2'
import {Layout} from 'universal/types/constEnums'

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
  const {slackAuth, slackNotifications} = teamMember!
  const channels = useSlackChannels(slackAuth)
  const {submitting, onError, onCompleted, submitMutation, error} = useMutationProps()
  const atmosphere = useAtmosphere()
  const localPrivateChannel = channels.find((channel) => channel.name === '@Parabol')
  const localPrivateChannelId = localPrivateChannel && localPrivateChannel.id
  const {isActive, defaultTeamChannelId} = slackAuth!

  const changeTeamChannel: SlackChannelDropdownOnClick = useCallback(
    (slackChannelId) => () => {
      // only change the active events
      const slackNotificationEvents = slackNotifications
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
      SetSlackNotificationMutation(
        atmosphere,
        {slackChannelId, slackNotificationEvents, teamId},
        {
          onError,
          onCompleted
        }
      )
    },
    [slackNotifications, defaultTeamChannelId]
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

export default createFragmentContainer(
  SlackNotificationList,
  graphql`
    fragment SlackNotificationList_viewer on User {
      ...SlackNotificationRow_viewer
      teamMember(teamId: $teamId) {
        slackAuth {
          accessToken
          botAccessToken
          isActive
          slackUserId
          defaultTeamChannelId
        }
        slackNotifications {
          channelId
          event
          eventType
        }
      }
    }
  `
)
