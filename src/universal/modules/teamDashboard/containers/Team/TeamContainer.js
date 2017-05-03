import PropTypes from 'prop-types';
import React from 'react';
import Team from 'universal/modules/teamDashboard/components/Team/Team';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import {Switch, Route, matchPath, withRouter} from 'react-router-dom';
import AgendaAndProjectsBundle from '../AgendaAndProjects/AgendaAndProjectsBundle';
import TeamSettingsBundle from '../TeamSettings/TeamSettingsBundle';
import TeamArchiveBundle from '../TeamArchive/TeamArchiveBundle';
import RouteWithProps from '../../../../components/RouteWithProps/RouteWithProps';

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
  const extraProps = {teamName: team.name};
  return (
    <Team
      hasDashAlert={hasDashAlert}
      isSettings={isSettings}
      team={team}
      teamMembers={teamMembers}
    >
      <Switch>
        {/* TODO: replace match.path with a relative when the time comes: https://github.com/ReactTraining/react-router/pull/4539*/}
        <RouteWithProps exact path={match.path} extraProps={extraProps} component={AgendaAndProjectsBundle} />
        <Route path={`${match.path}/settings`} component={TeamSettingsBundle} />
        <RouteWithProps path={`${match.path}/archive`} extraProps={extraProps} component={TeamArchiveBundle} />
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

export default withRouter(connect(mapStateToProps)(TeamContainer));
