import {cashay} from 'cashay';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {matchPath, Switch} from 'react-router-dom';
import AsyncRoute from 'universal/components/AsyncRoute/AsyncRoute';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import withReducer from 'universal/decorators/withReducer/withReducer';
import Team from 'universal/modules/teamDashboard/components/Team/Team';
import teamDashReducer from 'universal/modules/teamDashboard/ducks/teamDashDuck';

const teamContainerSub = `
query {
  team @cached(id: $teamId, type: "Team") {
    id
    isPaid
    name
    meetingId
  },
  teamMembers(teamId: $teamId) @live {
    id
    picture
    preferredName
    presence @cached(type: "[Presence]") {
      id
      userId
    }
  }
}`;


const mapStateToProps = (state, props) => {
  const {match: {params: {teamId}}} = props;
  const {hasDashAlert} = state.dash;
  const teamContainer = cashay.query(teamContainerSub, {
    op: 'teamContainer',
    key: teamId,
    resolveCached: {presence: (source) => (doc) => source.id.startsWith(doc.userId)},
    variables: {teamId}
  });
  const {team, teamMembers} = teamContainer.data;
  return {
    hasDashAlert,
    team,
    teamMembers
  };
};

const agendaProjects = () => System.import('universal/modules/teamDashboard/containers/AgendaAndProjects/AgendaAndProjectsContainer');
const teamSettings = () => System.import('universal/modules/teamDashboard/containers/TeamSettings/TeamSettingsContainer');
const archivedProjects = () => System.import('universal/modules/teamDashboard/containers/TeamArchive/TeamArchiveContainer');

const TeamContainer = (props) => {
  const {
    location: {pathname},
    match,
    hasDashAlert,
    team,
    teamMembers
  } = props;
  if (!team.id) {
    return <LoadingView />;
  }

  const isSettings = Boolean(matchPath(pathname, {
    path: '/team/:teamId/settings'
  }));
  return (
    <Team
      hasDashAlert={hasDashAlert}
      isSettings={isSettings}
      team={team}
      teamMembers={teamMembers}
    >
      <Switch>
        {/* TODO: replace match.path with a relative when the time comes: https://github.com/ReactTraining/react-router/pull/4539*/}
        <AsyncRoute bottom exact path={match.path} extraProps={{teamName: team.name}} mod={agendaProjects} />
        <AsyncRoute bottom path={`${match.path}/settings`} mod={teamSettings} />
        <AsyncRoute bottom path={`${match.path}/archive`} extraProps={{teamName: team.name}} mod={archivedProjects} />
      </Switch>
    </Team>
  );
};

TeamContainer.propTypes = {
  hasDashAlert: PropTypes.bool,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  }),
  match: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired,
  teamMembers: PropTypes.array.isRequired
};

export default withReducer({teamDashboard: teamDashReducer})(
  connect(mapStateToProps)(TeamContainer)
);
