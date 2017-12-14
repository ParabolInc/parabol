import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import UserProjectsHeader from 'universal/modules/userDashboard/components/UserProjectsHeader/UserProjectsHeader';

const mapStateToProps = (state) => {
  return {
    teamFilterId: state.userDashboard.teamFilterId,
    teamFilterName: state.userDashboard.teamFilterName
  };
};

const UserProjectsHeaderContainer = (props) => {
  const {dispatch, teams, teamFilterId, teamFilterName} = props;
  const teamsArray = teams || [];
  return (
    <UserProjectsHeader dispatch={dispatch} teams={teamsArray} teamFilterId={teamFilterId} teamFilterName={teamFilterName} />
  );
};

UserProjectsHeaderContainer.propTypes = {
  dispatch: PropTypes.func,
  teams: PropTypes.array,
  teamFilterId: PropTypes.string,
  teamFilterName: PropTypes.string
};

export default connect(mapStateToProps)(UserProjectsHeaderContainer);
