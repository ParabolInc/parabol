import React, {PropTypes} from 'react';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import UserActionList from 'universal/modules/userDashboard/components/UserActionList/UserActionList';


const userActionListQuery = `
query {
  actions(userId: $id) @live {
    content
    id
    isComplete
    updatedAt
    sortOrder
    team @cached(type: "Team") {
      name
    }
  }
  teams @cached(type: "[Team]") {
    id
    name
  }
}
`;

const mapStateToProps = (state) => {
  const {teamFilterId} = state.userDashboard;
  const actionFilterFn = teamFilterId ? (doc) => doc.id.startsWith(teamFilterId) : () => true;
  const teamsFilterFn = teamFilterId ? (doc) => doc.id === teamFilterId : () => true;
  const userId = state.auth.obj.sub;
  const {actions, teams} = cashay.query(userActionListQuery, {
    op: 'userActions',
    variables: {id: userId},
    key: teamFilterId || '',
    sort: {
      actions: (a, b) => a.sortOrder < b.sortOrder
    },
    resolveCached: {
      team: (source) => (doc) => source.id.startsWith(doc.id),
      // include every team that is cached. do this instead of the tms because otherwise we'll get null docs
      teams: () => () => true
    },
    filter: {
      actions: actionFilterFn,
      teams: teamsFilterFn
    }
  }).data;
  return {
    actions,
    teams,
    userId: state.auth.obj.sub,
    selectingNewActionTeam: state.userDashboard.selectingNewActionTeam
  };
};

const UserActionListContainer = (props) => {
  const {actions, dispatch, selectingNewActionTeam, teams, userId} = props;
  return (
    <UserActionList
      actions={actions}
      dispatch={dispatch}
      teams={teams}
      userId={userId}
      selectingNewActionTeam={selectingNewActionTeam}
    />
  );
};

UserActionListContainer.propTypes = {
  actions: PropTypes.array,
  dispatch: PropTypes.func,
  teams: PropTypes.array,
  userId: PropTypes.string,
  selectingNewActionTeam: PropTypes.bool
};

export default connect(mapStateToProps)(UserActionListContainer);
