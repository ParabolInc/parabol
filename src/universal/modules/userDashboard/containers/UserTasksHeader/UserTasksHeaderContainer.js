import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import UserTasksHeader from 'universal/modules/userDashboard/components/UserTasksHeader/UserTasksHeader';

const mapStateToProps = (state) => {
  return {
    teamFilterId: state.userDashboard.teamFilterId,
    teamFilterName: state.userDashboard.teamFilterName
  };
};

const UserTasksHeaderContainer = (props) => {
  const {dispatch, teams, teamFilterId, teamFilterName} = props;
  const teamsArray = teams || [];
  return (
    <UserTasksHeader dispatch={dispatch} teams={teamsArray} teamFilterId={teamFilterId} teamFilterName={teamFilterName} />
  );
};

UserTasksHeaderContainer.propTypes = {
  dispatch: PropTypes.func,
  teams: PropTypes.array,
  teamFilterId: PropTypes.string,
  teamFilterName: PropTypes.string
};

export default connect(mapStateToProps)(UserTasksHeaderContainer);
