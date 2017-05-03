import PropTypes from 'prop-types';
import React from 'react';
import Team from 'universal/modules/teamDashboard/components/Team/Team';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import DashboardWrapper from 'universal/components/DashboardWrapper/DashboardWrapper';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import {DragDropContext as dragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {Switch, Route, matchPath} from 'react-router-dom';
import AgendaAndProjectsBundle from "../AgendaAndProjects/AgendaAndProjectsBundle";
import TeamSettingsBundle from "../TeamSettings/TeamSettingsBundle";
import TeamArchiveBundle from "../TeamArchive/TeamArchiveBundle";

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
    match,
    hasDashAlert,
    team,
    teamMembers
  } = props;
  if (!team.id) {
    return (
      <DashboardWrapper>
        <LoadingView />
      </DashboardWrapper>
    )
  }

  const {url} = match;
  const pageTitle = `${team.name} Team Dashboard | Parabol`;
  const isSettings = matchPath(url, {
    path: '/team/:teamId/settings'
  });
  return (
    <DashboardWrapper title={pageTitle} url={url}>
      <Team
        hasDashAlert={hasDashAlert}
        isSettings={isSettings || false}
        team={team}
        teamMembers={teamMembers}
      >
        <Switch>
          {/* TODO: replace match.path with a relative when the time comes: https://github.com/ReactTraining/react-router/pull/4539*/}
          <Route exact path={match.path} component={AgendaAndProjectsBundle}/>
          <Route path={`${match.path}/settings`} component={TeamSettingsBundle}/>
          <Route path={`${match.path}/archive`} component={TeamArchiveBundle}/>
        </Switch>
      </Team>
    </DashboardWrapper>
  );
};

TeamContainer.propTypes = {
  hasDashAlert: PropTypes.bool,
  match: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired,
  teamMembers: PropTypes.array.isRequired
};

export default
dragDropContext(HTML5Backend)(
  socketWithPresence(
    connect(mapStateToProps)(
      TeamContainer
    )
  )
);
