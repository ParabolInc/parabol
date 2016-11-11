import React, {PropTypes} from 'react';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import UserActionList from 'universal/modules/userDashboard/components/UserActionList/UserActionList';

const getNewSortOrder = (actions, sourceSortOrder, targetSortOrder) => {
  const isDesc = actions[0].sortOrder > actions[1].sortOrder;
  const isMovingLeft = isDesc ? sourceSortOrder < targetSortOrder : sourceSortOrder > targetSortOrder;
  const targetIdx = actions.findIndex((action) => action.sortOrder === targetSortOrder);
  const afterTarget = isMovingLeft ? actions[targetIdx - 1] : actions[targetIdx + 1];
  if (afterTarget) {
    return (afterTarget.sortOrder + targetSortOrder) / 2;
  }
  return (isDesc === isMovingLeft) ? targetSortOrder + 1 : targetSortOrder - 1;
};

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
  updateAction(optimisticVariables, queryResponse, currentResponse) {
    if (optimisticVariables && optimisticVariables.hasOwnProperty('sortOrder')) {
      const {id, sortOrder} = optimisticVariables;

      const fromAction = currentResponse.actions.find((action) => action.id === id);
      fromAction.sortOrder = sortOrder;
      currentResponse.actions.sort((a, b) => b.sortOrder - a.sortOrder);
      return currentResponse;
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

// function getNewIndex(actions, sourceSortOrder, targetSortOrder) {
//   // if the source is above the target, put it below, otherwise, put it above
//   let xfactor = 1;
//   if (sourceSortOrder > targetSortOrder) {
//     // we're moving it up (if sort by ascending) or down (if desc)
//     xfactor = -1;
//   }
//   let minIndex = Infinity * xfactor;
//   for (let i = 0; i < actions.length; i++) {
//     const curAction = actions[i];
//     if (curAction.sortOrder === sourceSortOrder) {
//       continue;
//     }
//
//     if (xfactor * curAction.sortOrder > xfactor * targetSortOrder && xfactor * curAction.sortOrder < xfactor * minIndex) {
//       minIndex = curAction.sortOrder;
//     }
//   }
//   return (minIndex === Infinity * xfactor) ? targetSortOrder + xfactor : (targetSortOrder + minIndex) / 2;
// }

const UserActionListContainer = (props) => {
  const {actions, dispatch, queryKey, selectingNewActionTeam, teams, userId} = props;
  const dragAction = (sourceId, sourceSortOrder, targetSortOrder, monitorItems) => {
    const updatedSortOrder = getNewSortOrder(actions, sourceSortOrder, targetSortOrder);
    const options = {
      ops: {userActions: queryKey},
      variables: {updatedAction: {id: sourceId, sortOrder: updatedSortOrder}}
    };
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
