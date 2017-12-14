import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {createFragmentContainer} from 'react-relay';
import {matchPath, Switch} from 'react-router-dom';
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute';
import withReducer from 'universal/decorators/withReducer/withReducer';
import Team from 'universal/modules/teamDashboard/components/Team/Team';
import teamDashReducer from 'universal/modules/teamDashboard/ducks/teamDashDuck';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

const mapStateToProps = (state, props) => {
  const {match: {params: {teamId}}} = props;
  const {hasMeetingAlert} = state.dash;
  const userId = state.auth.obj.sub;
  return {
    hasMeetingAlert,
    teamMemberId: toTeamMemberId(teamId, userId)
  };
};

const agendaProjects = () => System.import('universal/modules/teamDashboard/components/AgendaAndProjectsRoot');
const teamSettings = () => System.import('universal/modules/teamDashboard/components/TeamSettingsWrapper/TeamSettingsWrapper');
const archivedProjects = () => System.import('universal/modules/teamDashboard/containers/TeamArchive/TeamArchiveRoot');

const TeamContainer = (props) => {
  const {
    location: {pathname},
    match,
    hasMeetingAlert,
    teamMemberId,
    viewer
  } = props;
  const team = viewer && viewer.team;
  const isSettings = Boolean(matchPath(pathname, {
    path: '/team/:teamId/settings'
  }));
  return (
    <Team
      hasMeetingAlert={hasMeetingAlert}
      isSettings={isSettings}
      team={team}
    >
      <Switch>
        {/* TODO: replace match.path with a relative when the time comes: https://github.com/ReactTraining/react-router/pull/4539 */}
        <AsyncRoute exact path={match.path} mod={agendaProjects} />
        <AsyncRoute path={`${match.path}/settings`} mod={teamSettings} extraProps={{teamMemberId}} />
        <AsyncRoute path={`${match.path}/archive`} extraProps={{team}} mod={archivedProjects} />
      </Switch>
    </Team>
  );
};

TeamContainer.propTypes = {
  hasMeetingAlert: PropTypes.bool,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  }),
  match: PropTypes.object.isRequired,
  viewer: PropTypes.object,
  teamMemberId: PropTypes.string.isRequired
};

export default createFragmentContainer(
  withReducer({teamDashboard: teamDashReducer})(
    connect(mapStateToProps)(TeamContainer)
  ),
  graphql`
    fragment TeamContainer_viewer on User {
      team(teamId: $teamId) {
        ...Team_team
        ...TeamArchive_team
      }
    }
  `
);
