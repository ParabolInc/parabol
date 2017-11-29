import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import UserTasksHeader from 'universal/modules/userDashboard/components/UserTasksHeader/UserTasksHeader';
import {cashay} from 'cashay';

const userColumnsQuery = `
query {
  teams @cached(type: "[Team]") {
    id
    name
  }
}
`;

const mapStateToProps = (state) => {
  const {teams} = cashay.query(userColumnsQuery, {
    op: 'userTasksHeaderContainer',
    resolveCached: {
      teams: () => () => true
    },
    sort: {
      teams: (a, b) => a.name > b.name ? 1 : -1
    }
  }).data;
  return {
    teams,
    teamFilterId: state.userDashboard.teamFilterId,
    teamFilterName: state.userDashboard.teamFilterName
  };
};

const UserTasksHeaderContainer = (props) => {
  const {dispatch, teams, teamFilterId, teamFilterName} = props;
  return (
    <UserTasksHeader dispatch={dispatch} teams={teams} teamFilterId={teamFilterId} teamFilterName={teamFilterName} />
  );
};

UserTasksHeaderContainer.propTypes = {
  dispatch: PropTypes.func,
  teams: PropTypes.array,
  teamFilterId: PropTypes.string,
  teamFilterName: PropTypes.string
};

export default connect(mapStateToProps)(UserTasksHeaderContainer);
