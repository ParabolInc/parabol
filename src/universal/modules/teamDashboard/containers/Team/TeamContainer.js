import PropTypes from 'prop-types'
import React from 'react'
import {connect} from 'react-redux'
import {createFragmentContainer} from 'react-relay'
import {matchPath, Switch} from 'react-router-dom'
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute'
import withReducer from 'universal/decorators/withReducer/withReducer'
import Team from 'universal/modules/teamDashboard/components/Team/Team'
import teamDashReducer from 'universal/modules/teamDashboard/ducks/teamDashDuck'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'

const mapStateToProps = (state, props) => {
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

const agendaTasks = () =>
  import(/* webpackChunkName: 'AgendaAndTasksRoot' */ 'universal/modules/teamDashboard/components/AgendaAndTasksRoot')
const teamSettings = () =>
  import(/* webpackChunkName: 'TeamSettingsWrapper' */ 'universal/modules/teamDashboard/components/TeamSettingsWrapper/TeamSettingsWrapper')
const archivedTasks = () =>
  import(/* webpackChunkName: 'TeamArchiveRoot' */ 'universal/modules/teamDashboard/containers/TeamArchive/TeamArchiveRoot')

const TeamContainer = (props) => {
  const {
    location: {pathname},
    match,
    teamMemberId,
    viewer
  } = props
  const team = viewer && viewer.team
  const isSettings = Boolean(
    matchPath(pathname, {
      path: '/team/:teamId/settings'
    })
  )
  return (
    <Team hasMeetingAlert={viewer && viewer.hasMeetingAlert} isSettings={isSettings} team={team}>
      <Switch>
        {/* TODO: replace match.path with a relative when the time comes: https://github.com/ReactTraining/react-router/pull/4539 */}
        <AsyncRoute exact path={match.path} mod={agendaTasks} />
        <AsyncRoute
          path={`${match.path}/settings`}
          mod={teamSettings}
          extraProps={{teamMemberId}}
        />
        <AsyncRoute path={`${match.path}/archive`} extraProps={{team}} mod={archivedTasks} />
      </Switch>
    </Team>
  )
}

TeamContainer.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  }),
  match: PropTypes.object.isRequired,
  viewer: PropTypes.object,
  teamMemberId: PropTypes.string.isRequired
}

export default createFragmentContainer(
  withAtmosphere(
    withReducer({teamDashboard: teamDashReducer})(connect(mapStateToProps)(TeamContainer))
  ),
  graphql`
    fragment TeamContainer_viewer on User {
      hasMeetingAlert
      team(teamId: $teamId) {
        ...Team_team
        ...TeamArchive_team
      }
    }
  `
)
