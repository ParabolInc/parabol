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
  }
  teams @cached(type: "[Team]") {
    name
  }
}
`;

const mapStateToProps = (state) => {
  const {actions, teams} = cashay.query(userActionListQuery, {
    op: 'userActions',
    variables: {id: state.auth.obj.sub},
    sort: {
      actions: (a, b) => a.sortOrder < b.sortOrder
    },
    resolveCached: {
      teams: () => state.auth.obj.tms
    }
  }).data;
  return {
    actions,
    teams,
    userId: state.auth.obj.sub
  };
};

const UserActionListContainer = (props) => {
  const {actions, dispatch, teams, userId} = props;
  return <UserActionList actions={actions} dispatch={dispatch} teams={teams} userId={userId}/>;
};

UserActionListContainer.propTypes = {
  actions: PropTypes.array,
};

export default connect(mapStateToProps)(UserActionListContainer);
