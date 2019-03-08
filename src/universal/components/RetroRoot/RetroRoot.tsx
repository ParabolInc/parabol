import React from 'react'
import {graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import NewMeetingWithLocalState from 'universal/components/NewMeetingWithLocalState'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import NewAuthTokenSubscription from 'universal/subscriptions/NewAuthTokenSubscription'
import NotificationSubscription from 'universal/subscriptions/NotificationSubscription'
import OrganizationSubscription from 'universal/subscriptions/OrganizationSubscription'
import TaskSubscription from 'universal/subscriptions/TaskSubscription'
import TeamMemberSubscription from 'universal/subscriptions/TeamMemberSubscription'
import TeamSubscription from 'universal/subscriptions/TeamSubscription'
import {cacheConfig, RETROSPECTIVE} from 'universal/utils/constants'
import renderQuery from '../../utils/relay/renderQuery'

const query = graphql`
  query RetroRootQuery($teamId: ID!, $meetingType: MeetingTypeEnum!) {
    viewer {
      ...NewMeetingWithLocalState_viewer
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

interface Props
  extends WithAtmosphereProps,
    RouteComponentProps<{localPhase: string; teamId: string}> {}

const meetingType = RETROSPECTIVE
const RetroRoot = ({atmosphere, history, location, match}: Props) => {
  const {
    params: {localPhase, teamId = 'demoTeam'}
  } = match
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{teamId, meetingType}}
      subscriptions={subscriptions}
      subParams={{history, location}}
      render={renderQuery(NewMeetingWithLocalState, {props: {localPhase, match, meetingType}})}
    />
  )
}

export default withAtmosphere(withRouter(RetroRoot))
