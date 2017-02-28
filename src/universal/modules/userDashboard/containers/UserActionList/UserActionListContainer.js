import React, {PropTypes} from 'react';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import UserActionList from 'universal/modules/userDashboard/components/UserActionList/UserActionList';

const userActionListQuery = `
query {
  actionCount(userId: $id)
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

const mutationHandlers = {
  updateAction(optimisticUpdates, queryResponse, currentResponse) {
    if (optimisticUpdates) {
      const {updatedAction} = optimisticUpdates;
      if (updatedAction && updatedAction.hasOwnProperty('sortOrder')) {
        const {id, sortOrder} = updatedAction;
        const {actions} = currentResponse;
        const fromAction = actions.find((action) => action.id === id);
        if (fromAction && sortOrder !== undefined) {
          fromAction.sortOrder = sortOrder;
          actions.sort((a, b) => b.sortOrder - a.sortOrder);
          return currentResponse;
        }
      }
    }
    return undefined;
  }
};

const mapStateToProps = (state) => {
  const {teamFilterId} = state.userDashboard;
  const actionFilterFn = teamFilterId ? (doc) => doc.id.startsWith(teamFilterId) : () => true;
  const teamsFilterFn = teamFilterId ? (doc) => doc.id === teamFilterId : () => true;
  const userId = state.auth.obj.sub;
  const queryKey = teamFilterId || '';
  const {actionCount, actions, teams} = cashay.query(userActionListQuery, {
    op: 'userActions',
    variables: {id: userId},
    key: queryKey,
    sort: {
      actions: (a, b) => b.sortOrder - a.sortOrder
    },
    resolveCached: {
      team: (source) => (doc) => source.id.startsWith(doc.id),
      // include every team that is cached. do this instead of the tms because otherwise we'll get null docs
      teams: () => () => true
    },
    filter: {
      actions: actionFilterFn,
      teams: teamsFilterFn
    },
    mutationHandlers
  }).data;
  return {
    initialActionCount: actionCount,
    actions,
    teams,
    userId: state.auth.obj.sub,
    selectingNewActionTeam: state.userDashboard.selectingNewActionTeam,
    queryKey
  };
};

const UserActionListContainer = (props) => {
  const {initialActionCount, actions, dispatch, queryKey, selectingNewActionTeam, teams, userId} = props;
  if (initialActionCount === null) {
    return null;
  }
  return (
    <UserActionList
      actions={actions}
      dispatch={dispatch}
      queryKey={queryKey}
      selectingNewActionTeam={selectingNewActionTeam}
      teams={teams}
      userId={userId}
    />
  );
};

UserActionListContainer.propTypes = {
  actions: PropTypes.array,
  dispatch: PropTypes.func,
  initialActionCount: PropTypes.number,
  queryKey: PropTypes.string,
  selectingNewActionTeam: PropTypes.bool,
  teams: PropTypes.array,
  userId: PropTypes.string,
};

export default connect(mapStateToProps)(UserActionListContainer);
