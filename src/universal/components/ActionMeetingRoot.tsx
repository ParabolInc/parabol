import React from 'react'
import {graphql} from 'react-relay'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import ActionMeeting from 'universal/components/ActionMeeting'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import useRouter from 'universal/hooks/useRouter'
import NewAuthTokenSubscription from 'universal/subscriptions/NewAuthTokenSubscription'
import NotificationSubscription from 'universal/subscriptions/NotificationSubscription'
import OrganizationSubscription from 'universal/subscriptions/OrganizationSubscription'
import TaskSubscription from 'universal/subscriptions/TaskSubscription'
import TeamMemberSubscription from 'universal/subscriptions/TeamMemberSubscription'
import TeamSubscription from 'universal/subscriptions/TeamSubscription'
import {MeetingTypeEnum} from 'universal/types/graphql'
import {cacheConfig} from 'universal/utils/constants'
import renderQuery from '../utils/relay/renderQuery'

const query = graphql`
  query ActionMeetingRootQuery($teamId: ID!) {
    viewer {
      ...ActionMeeting_viewer
    }
  }
`

const subscriptions = [
  NewAuthTokenSubscription,
  NotificationSubscription,
  OrganizationSubscription,
  TaskSubscription,
  TeamMemberSubscription,
  TeamSubscription
]

const meetingType = MeetingTypeEnum.action
const ActionMeetingRoot = () => {
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
      render={renderQuery(ActionMeeting)}
    />
  )
}

export default ActionMeetingRoot
