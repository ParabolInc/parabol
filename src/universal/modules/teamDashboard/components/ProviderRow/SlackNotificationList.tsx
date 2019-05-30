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

const TEAM_EVENTS = [SlackNotificationEventEnum.meetingStart, SlackNotificationEventEnum.meetingEnd]

const TitleAndPicker = styled('div')({
  alignItems: 'center',
  display: 'flex',
  marginBottom: 16
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

  const uniqueChannelIds = useMemo(() => {
    const notificationsForEvent = slackNotifications.filter((notification) =>
      TEAM_EVENTS.includes(notification.event as any)
    )
    const channelsUsed = notificationsForEvent.map(({channelId}) => channelId)
    return Array.from(new Set(channelsUsed))
  }, [slackNotifications])
  const [localChannelId, setLocalChannelId] = useState(uniqueChannelIds[0])

  const changeChannel: SlackChannelDropdownOnClick = useCallback(
    (slackChannelId) => () => {
      setLocalChannelId(slackChannelId)
      // only change the active events
      const slackNotificationEvents = slackNotifications
        .filter((notification) => notification.channelId)
        .map(({event}) => event)
      if (submitting || localChannelId === slackChannelId || slackNotificationEvents.length === 0) {
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
    [slackNotifications, localChannelId]
  )

  if (!slackAuth || !slackAuth.accessToken) return null
  return (
    <SlackNotificationListStyles>
      <TitleAndPicker>
        <Heading>Team Notifications</Heading>
        <SlackChannelPicker
          channels={channels}
          events={TEAM_EVENTS}
          localChannelId={localChannelId}
          onClick={changeChannel}
        />
      </TitleAndPicker>
      {error && <StyledError>{error}</StyledError>}
      <SlackNotificationRow
        event={SlackNotificationEventEnum.meetingStart}
        localChannelId={localChannelId}
        teamId={teamId}
        viewer={viewer}
      />
      <SlackNotificationRow
        event={SlackNotificationEventEnum.meetingEnd}
        localChannelId={localChannelId}
        teamId={teamId}
        viewer={viewer}
      />
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
      }
      slackNotifications(teamId: $teamId) {
        channelId
        event
      }
    }
  `
)
