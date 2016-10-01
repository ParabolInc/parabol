import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import UserProjectsHeader from 'universal/modules/userDashboard/components/UserProjectsHeader/UserProjectsHeader';
import {cashay} from 'cashay';

const userColumnsQuery = `
query {
  teams @live {
    id
    name
  }
}
`;

const mapStateToProps = (state) => {
  const {teams} = cashay.query(userColumnsQuery, {
    op: 'userProjectsHeaderContainer',
    sort: {
      teams: (a, b) => a.name > b.name
    }
  }).data;
  return {
    teams,
    teamFilterId: state.userDashboard.teamFilterId,
    teamFilterName: state.userDashboard.teamFilterName
  };
};

const UserProjectsHeaderContainer = (props) => {
  const {dispatch, teams, teamFilterId, teamFilterName} = props;
  return (
    <UserProjectsHeader dispatch={dispatch} teams={teams} teamFilterId={teamFilterId} teamFilterName={teamFilterName}/>
  );
};

UserProjectsHeaderContainer.propTypes = {
  dispatch: PropTypes.func,
  teams: PropTypes.array,
  teamFilterId: PropTypes.string,
  teamFilterName: PropTypes.string
};

export default connect(mapStateToProps)(UserProjectsHeaderContainer);
