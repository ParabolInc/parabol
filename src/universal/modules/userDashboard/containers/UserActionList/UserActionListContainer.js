import React, {PropTypes} from 'react';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import UserActionList from 'universal/modules/userDashboard/components/UserActionList/UserActionList';
import getNewSortOrder from 'universal/utils/getNewSortOrder';
import {MIN_SORT_RESOLUTION} from 'universal/utils/constants';

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
  const {actions, teams} = cashay.query(userActionListQuery, {
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
    actions,
    teams,
    userId: state.auth.obj.sub,
    selectingNewActionTeam: state.userDashboard.selectingNewActionTeam,
    queryKey
  };
};

const UserActionListContainer = (props) => {
  const {actions, dispatch, queryKey, selectingNewActionTeam, teams, userId} = props;
  const dragAction = (sourceId, sourceSortOrder, targetSortOrder, monitorItems) => {
    const updatedSortOrder = getNewSortOrder(actions, sourceSortOrder, targetSortOrder, true, 'sortOrder');
    const options = {
      ops: {userActions: queryKey},
      variables: {updatedAction: {id: sourceId, sortOrder: updatedSortOrder}}
    };
    if (Math.abs(targetSortOrder - updatedSortOrder) < MIN_SORT_RESOLUTION) {
      options.variables.rebalance = true;
    }
    // mutative!
    monitorItems.sortOrder = updatedSortOrder;
    cashay.mutate('updateAction', options);
  };
  return (
    <UserActionList
      actions={actions}
      dispatch={dispatch}
      dragAction={dragAction}
      selectingNewActionTeam={selectingNewActionTeam}
      teams={teams}
      userId={userId}
    />
  );
};

UserActionListContainer.propTypes = {
  actions: PropTypes.array,
  dispatch: PropTypes.func,
  queryKey: PropTypes.string,
  selectingNewActionTeam: PropTypes.bool,
  teams: PropTypes.array,
  userId: PropTypes.string,
};

export default connect(mapStateToProps)(UserActionListContainer);
