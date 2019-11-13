import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useRouter from '../hooks/useRouter'
import NotificationSubscription from '../subscriptions/NotificationSubscription'
import OrganizationSubscription from '../subscriptions/OrganizationSubscription'
import TaskSubscription from '../subscriptions/TaskSubscription'
import TeamSubscription from '../subscriptions/TeamSubscription'
import {MeetingTypeEnum} from '../types/graphql'
import renderQuery from '../utils/relay/renderQuery'
import useSubscription from '../hooks/useSubscription'
import ActionMeetingLobby from './ActionMeetingLobby'

const query = graphql`
  query ActionMeetingRootQuery($teamId: ID!) {
    viewer {
      ...ActionMeetingLobby_viewer
    }
  }
`

const meetingType = MeetingTypeEnum.action
const ActionMeetingRoot = () => {
  const atmosphere = useAtmosphere()
  const {match} = useRouter<{teamId: string}>()
  const {params} = match
  const {teamId} = params
  useSubscription(ActionMeetingRoot.name, NotificationSubscription)
  useSubscription(ActionMeetingRoot.name, OrganizationSubscription)
  useSubscription(ActionMeetingRoot.name, TaskSubscription)
  useSubscription(ActionMeetingRoot.name, TeamSubscription)
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{teamId, meetingType}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(ActionMeetingLobby)}
    />
  )
}

export default ActionMeetingRoot
