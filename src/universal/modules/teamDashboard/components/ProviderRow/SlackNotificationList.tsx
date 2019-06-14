import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import {SlackNotificationEventEnum} from 'universal/types/graphql'
import SlackNotificationRow from 'universal/modules/teamDashboard/components/ProviderRow/SlackNotificationRow'
import {SlackNotificationList_viewer} from '__generated__/SlackNotificationList_viewer.graphql'
import React, {useCallback, useMemo, useState} from 'react'
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
  borderTop: `1px solid ${PALETTE.BORDER.LIGHTER}`,
  padding: Layout.ROW_GUTTER
})

interface Props {
  teamId: string
  viewer: SlackNotificationList_viewer
}

const TEAM_EVENTS = [
  SlackNotificationEventEnum.meetingStart,
  SlackNotificationEventEnum.meetingEnd,
  SlackNotificationEventEnum.meetingNextStageReady
]
const USER_EVENTS = [SlackNotificationEventEnum.meetingStageTimeLimit]

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

const SlackNotificationList = (props: Props) => {
  const {teamId, viewer} = props
  const {slackAuth, slackNotifications} = viewer
  const channels = useSlackChannels(slackAuth)
  const {submitting, onError, onCompleted, submitMutation, error} = useMutationProps()
  const atmosphere = useAtmosphere()
  const localPrivateChannel = channels.find((channel) => channel.name === '@Parabol')
  const localPrivateChannelId = localPrivateChannel && localPrivateChannel.id
  const uniqueChannelIds = useMemo(() => {
    const notificationsForEvent = slackNotifications.filter(
      (notification) => TEAM_EVENTS.includes(notification.event as any) && notification.channelId
    )
    const channelsUsed = notificationsForEvent.map(({channelId}) => channelId)
    return Array.from(new Set(channelsUsed))
  }, [slackNotifications])
  const [localTeamChannelId, setLocalTeamChannelId] = useState(uniqueChannelIds[0])

  const changeTeamChannel: SlackChannelDropdownOnClick = useCallback(
    (slackChannelId) => () => {
      setLocalTeamChannelId(slackChannelId)
      // only change the active events
      const slackNotificationEvents = slackNotifications
        .filter(
          (notification) =>
            notification.channelId &&
            TEAM_EVENTS.includes(notification.event as SlackNotificationEventEnum)
        )
        .map(({event}) => event)
      if (
        submitting ||
        localTeamChannelId === slackChannelId ||
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
    [slackNotifications, localTeamChannelId]
  )

  return (
    <SlackNotificationListStyles>
      <TeamGroup>
        <Heading>Team Notifications</Heading>
        <SlackChannelPicker
          channels={channels}
          isTokenValid={(slackAuth && !!slackAuth.botAccessToken) || false}
          localChannelId={localTeamChannelId}
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
            localChannelId={localTeamChannelId}
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
      slackAuth(teamId: $teamId) {
        accessToken
        botAccessToken
        slackUserId
      }
      slackNotifications(teamId: $teamId) {
        channelId
        event
      }
    }
  `
)
