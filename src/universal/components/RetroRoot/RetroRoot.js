// @flow
import React from 'react'
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent'
import LoadingView from 'universal/components/LoadingView/LoadingView'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import RelayTransitionGroup from 'universal/components/RelayTransitionGroup'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import {cacheConfig, RETROSPECTIVE} from 'universal/utils/constants'
import OrganizationSubscription from 'universal/subscriptions/OrganizationSubscription'
import NewAuthTokenSubscription from 'universal/subscriptions/NewAuthTokenSubscription'
import TaskSubscription from 'universal/subscriptions/TaskSubscription'
import TeamMemberSubscription from 'universal/subscriptions/TeamMemberSubscription'
import NotificationSubscription from 'universal/subscriptions/NotificationSubscription'
import TeamSubscription from 'universal/subscriptions/TeamSubscription'
import type {Dispatch} from 'redux'
import type {Location, Match, RouterHistory} from 'react-router-dom'
import {withRouter} from 'react-router-dom'
import {connect} from 'react-redux'
import NewMeetingWithLocalState from 'universal/components/NewMeetingWithLocalState'

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

type Props = {
  atmosphere: Object,
  dispatch: Dispatch<*>,
  location: Location,
  match: Match,
  history: RouterHistory
}

const meetingType = RETROSPECTIVE
const RetroRoot = ({atmosphere, dispatch, history, location, match}: Props) => {
  const {
    params: {localPhase, teamId}
  } = match
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{teamId, meetingType}}
      subscriptions={subscriptions}
      subParams={{dispatch, history, location}}
      render={(readyState) => (
        <RelayTransitionGroup
          readyState={readyState}
          error={<ErrorComponent height={'14rem'} />}
          loading={<LoadingView minHeight='50vh' />}
          ready={
            <NewMeetingWithLocalState
              localPhase={localPhase}
              match={match}
              meetingType={meetingType}
            />
          }
        />
      )}
    />
  )
}

export default withAtmosphere(connect()(withRouter(RetroRoot)))
