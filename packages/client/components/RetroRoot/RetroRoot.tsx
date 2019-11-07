import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {QueryRenderer} from 'react-relay'
import RetroMeeting from '../RetroMeeting'
import useAtmosphere from '../../hooks/useAtmosphere'
import useRouter from '../../hooks/useRouter'
import NotificationSubscription from '../../subscriptions/NotificationSubscription'
import OrganizationSubscription from '../../subscriptions/OrganizationSubscription'
import TaskSubscription from '../../subscriptions/TaskSubscription'
import TeamSubscription from '../../subscriptions/TeamSubscription'
import {MeetingTypeEnum} from '../../types/graphql'
import renderQuery from '../../utils/relay/renderQuery'
import useSubscription from '../../hooks/useSubscription'

const query = graphql`
  query RetroRootQuery($teamId: ID!) {
    viewer {
      ...RetroMeeting_viewer
    }
  }
`

const meetingType = MeetingTypeEnum.retrospective
const RetroRoot = () => {
  const atmosphere = useAtmosphere()
  const {match} = useRouter<{teamId: string}>()
  const {params} = match
  const {teamId = 'demoTeam'} = params
  useSubscription(RetroRoot.name, NotificationSubscription)
  useSubscription(RetroRoot.name, OrganizationSubscription)
  useSubscription(RetroRoot.name, TaskSubscription)
  useSubscription(RetroRoot.name, TeamSubscription)
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{teamId, meetingType}}
      fetchPolicy={'store-or-network'}
      render={renderQuery(RetroMeeting)}
    />
  )
}

export default RetroRoot
