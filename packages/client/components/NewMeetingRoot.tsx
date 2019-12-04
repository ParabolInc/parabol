import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useRouter from '../hooks/useRouter'
import renderQuery from '../utils/relay/renderQuery'
import NewMeeting from './NewMeeting'
import useSubscription from '../hooks/useSubscription'
import NotificationSubscription from '../subscriptions/NotificationSubscription'
import OrganizationSubscription from '../subscriptions/OrganizationSubscription'
import TaskSubscription from '../subscriptions/TaskSubscription'
import TeamSubscription from '../subscriptions/TeamSubscription'

const query = graphql`
  query NewMeetingRootQuery {
    viewer {
      ...NewMeeting_viewer
    }
  }
`

const NewMeetingRoot = () => {
  const atmosphere = useAtmosphere()
  const {match} = useRouter<{teamId: string}>()
  const {params} = match
  const {teamId} = params
  useSubscription(NewMeetingRoot.name, NotificationSubscription)
  useSubscription(NewMeetingRoot.name, OrganizationSubscription)
  useSubscription(NewMeetingRoot.name, TaskSubscription)
  useSubscription(NewMeetingRoot.name, TeamSubscription)
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(NewMeeting, {props: {teamId}})}
    />
  )
}

export default NewMeetingRoot
