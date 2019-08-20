import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import QueryRenderer from '../QueryRenderer/QueryRenderer'
import RetroMeeting from '../RetroMeeting'
import useAtmosphere from '../../hooks/useAtmosphere'
import useRouter from '../../hooks/useRouter'
import NotificationSubscription from '../../subscriptions/NotificationSubscription'
import OrganizationSubscription from '../../subscriptions/OrganizationSubscription'
import TaskSubscription from '../../subscriptions/TaskSubscription'
import TeamSubscription from '../../subscriptions/TeamSubscription'
import {MeetingTypeEnum} from '../../types/graphql'
import {cacheConfig} from '../../utils/constants'
import renderQuery from '../../utils/relay/renderQuery'

const query = graphql`
  query RetroRootQuery($teamId: ID!) {
    viewer {
      ...RetroMeeting_viewer
    }
  }
`

const subscriptions = [
  NotificationSubscription,
  OrganizationSubscription,
  TaskSubscription,
  TeamSubscription
]

const meetingType = MeetingTypeEnum.retrospective
const RetroRoot = () => {
  const atmosphere = useAtmosphere()
  const {history, location, match} = useRouter<{teamId: string}>()
  const {params} = match
  const {teamId = 'demoTeam'} = params
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{teamId, meetingType}}
      subscriptions={subscriptions}
      subParams={{history, location}}
      render={renderQuery(RetroMeeting)}
    />
  )
}

export default RetroRoot
