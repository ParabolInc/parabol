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
}
`;

const mapStateToProps = (state) => {
  const {actions} = cashay.query(userActionListQuery, {
    op: 'userActions',
    variables: {id: state.auth.obj.sub},
    directives: {
      actions: {
        sort: (a,b) => a.sortOrder > b.sortOrder
      }
    }
  }).data;
  return {
    actions
  };
};

const UserActionListContainer = (props) => {
  const {actions} = props;
  return <UserActionList actions={actions}/>;
};

UserActionListContainer.propTypes = {
  actions: PropTypes.array,
};

export default connect(mapStateToProps)(UserActionListContainer);
