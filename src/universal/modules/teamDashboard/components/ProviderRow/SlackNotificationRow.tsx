import {createFragmentContainer, graphql} from 'react-relay'
import {SlackNotificationEventEnum} from 'universal/types/graphql'
import React, {useMemo} from 'react'
import {SlackNotificationRow_viewer} from '__generated__/SlackNotificationRow_viewer.graphql'

interface Props {
  event: SlackNotificationEventEnum
  viewer: SlackNotificationRow_viewer
}

const labelLookup = {
  [SlackNotificationEventEnum.meetingEnd]: 'Meeting End',
  [SlackNotificationEventEnum.meetingStart]: 'Meeting Start'
}

const SlackNotificationRow = (props: Props) => {
  const {event, viewer} = props
  const {slackNotifications} = viewer
  const existingNotificaiton = useMemo(() => {
    return slackNotifications.find((notification) => notification.event === event)
  }, [slackNotifications])
  const label = labelLookup[event]
  return (
    <div>
      {label} - {existingNotificaiton ? existingNotificaiton.channelId : ''}
    </div>
  )
}

export default createFragmentContainer(
  SlackNotificationRow,
  graphql`
    fragment SlackNotificationRow_viewer on User {
      slackNotifications(teamId: $teamId) {
        channelId
        event
      }
    }
  `
)
