import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import {SlackNotificationEventEnum} from 'universal/types/graphql'
import SlackNotificationRow from 'universal/modules/teamDashboard/components/ProviderRow/SlackNotificationRow'
import {SlackNotificationList_viewer} from '__generated__/SlackNotificationList_viewer.graphql'
import React from 'react'

const SlackNotificationListStyles = styled('div')({
  marginTop: 16
})

interface Props {
  viewer: SlackNotificationList_viewer
}

const SlackNotificationList = (props: Props) => {
  const {viewer} = props
  const {slackAuth} = viewer
  if (!slackAuth || !slackAuth.isActive) return null
  return (
    <SlackNotificationListStyles>
      <SlackNotificationRow event={SlackNotificationEventEnum.meetingStart} viewer={viewer} />
      <SlackNotificationRow event={SlackNotificationEventEnum.meetingEnd} viewer={viewer} />
    </SlackNotificationListStyles>
  )
}

export default createFragmentContainer(
  SlackNotificationList,
  graphql`
    fragment SlackNotificationList_viewer on User {
      ...SlackNotificationRow_viewer
      slackAuth(teamId: $teamId) {
        isActive
      }
    }
  `
)
