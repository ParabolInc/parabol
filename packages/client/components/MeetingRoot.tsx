import React, {useEffect} from 'react'
import graphql from 'babel-plugin-relay/macro'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useRouter from '../hooks/useRouter'
import NotificationSubscription from '../subscriptions/NotificationSubscription'
import OrganizationSubscription from '../subscriptions/OrganizationSubscription'
import TaskSubscription from '../subscriptions/TaskSubscription'
import TeamSubscription from '../subscriptions/TeamSubscription'
import renderQuery from '../utils/relay/renderQuery'
import useSubscription from '../hooks/useSubscription'
import MeetingSelector from './MeetingSelector'

// Changing the name here requires a change to getLastSeenAtURL.ts
const query = graphql`
  query MeetingRootQuery($meetingId: ID!) {
    viewer {
      ...MeetingSelector_viewer
    }
  }
`

const MeetingRoot = () => {
  const atmosphere = useAtmosphere()
  const {history, match} = useRouter<{meetingId: string}>()
  const {params} = match
  const {meetingId} = params
  useSubscription(MeetingRoot.name, NotificationSubscription)
  useSubscription(MeetingRoot.name, OrganizationSubscription)
  useSubscription(MeetingRoot.name, TaskSubscription)
  useSubscription(MeetingRoot.name, TeamSubscription)
  useEffect(() => {
    if (!meetingId) {
      history.replace('/me')
    }
  }, [])
  if (!meetingId) return null
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{meetingId}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(MeetingSelector, {props: {meetingId}})}
    />
  )
}

export default MeetingRoot
