import {TeamContainer_viewer} from '../../../../__generated__/TeamContainer_viewer.graphql'
import React, {lazy, Suspense, useEffect} from 'react'
import {connect} from 'react-redux'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Route, RouteComponentProps, withRouter} from 'react-router'
import {matchPath, Switch} from 'react-router-dom'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../../decorators/withAtmosphere/withAtmosphere'
import withReducer from '../../../../decorators/withReducer/withReducer'
import Team from '../../components/Team/Team'
import teamDashReducer from '../../ducks/teamDashDuck'
import toTeamMemberId from '../../../../utils/relay/toTeamMemberId'

const mapStateToProps = (_state, props) => {
  const {
    atmosphere: {viewerId},
    match: {
      params: {teamId}
    }
  } = props
  return {
    teamMemberId: toTeamMemberId(teamId, viewerId)
  }
}

const AgendaTasks = lazy(() =>
  import(/* webpackChunkName: 'AgendaAndTasksRoot' */ '../../components/AgendaAndTasksRoot')
)
const TeamSettings = lazy(() =>
  import(/* webpackChunkName: 'TeamSettingsWrapper' */ '../../components/TeamSettingsWrapper/TeamSettingsWrapper')
)
const ArchivedTasks = lazy(() =>
  import(/* webpackChunkName: 'TeamArchiveRoot' */ '../TeamArchive/TeamArchiveRoot')
)

interface Props extends WithAtmosphereProps, RouteComponentProps<{}> {
  teamId: string
  viewer: TeamContainer_viewer
}

const TeamContainer = (props: Props) => {
  const {
    history,
    location: {pathname},
    match,
    teamId,
    viewer
  } = props
  useEffect(() => {
    if (viewer && !viewer.team) {
      history.replace({
        pathname: `/invitation-required/${teamId}`,
        search: `?redirectTo=${encodeURIComponent(pathname)}`
      })
    }
  })
  if (viewer && !viewer.team) return null
  const team = viewer && viewer.team
  const isSettings = Boolean(
    matchPath(pathname, {
      path: '/team/:teamId/settings'
    })
  )
  return (
    <Team isSettings={isSettings} team={team}>
      <Suspense fallback={''}>
        <Switch>
          {/* TODO: replace match.path with a relative when the time comes: https://github.com/ReactTraining/react-router/pull/4539 */}
          <Route exact path={match.path} component={AgendaTasks} />
          <Route path={`${match.path}/settings`} component={TeamSettings} />
          <Route
            path={`${match.path}/archive`}
            render={(p) => <ArchivedTasks {...p} team={team} />}
          />
        </Switch>
      </Suspense>
    </Team>
  )
}

export default createFragmentContainer(
  withAtmosphere(
    (withReducer as any)({teamDashboard: teamDashReducer})(
      (connect as any)(mapStateToProps)(withRouter(TeamContainer))
    )
  ),
  {
    viewer: graphql`
      fragment TeamContainer_viewer on User {
        team(teamId: $teamId) {
          ...Team_team
          ...TeamArchive_team
        }
      }
    `
  }
)
