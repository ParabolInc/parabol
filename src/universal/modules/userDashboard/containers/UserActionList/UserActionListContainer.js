import React, {PropTypes} from 'react';
import subscriptions from 'universal/subscriptions/subscriptions';
import {ACTIONS} from 'universal/subscriptions/constants';
import subscriber from 'universal/subscriptions/subscriber';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import UserActionList from 'universal/modules/userDashboard/components/UserActionList/UserActionList';

const actionsSubQuery = subscriptions.find(sub => sub.channel === ACTIONS).string;

const resolveUserActions = (userId) => {
  const {actions} = cashay.subscribe(actionsSubQuery, subscriber, {
    dep: 'userActions',
    op: ACTIONS,
    variables: {userId},
  }).data;
  return actions.sort((a, b) => a.userSort > b.userSort);
};

const mapStateToProps = (state) => {
  return {
    actions: cashay.computed('userActions', [state.auth.obj.sub], resolveUserActions)
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
