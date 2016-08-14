import React, {PropTypes} from 'react';
import subscriptions from 'universal/subscriptions/subscriptions';
import {ACTIONS} from 'universal/subscriptions/constants';
import subscriber from 'universal/subscriptions/subscriber';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import UserActionList from 'universal/modules/userDashboard/components/UserActionList/UserActionList';

const actionsSubString = subscriptions.find(sub => sub.channel === ACTIONS).string;

const mapStateToProps = (state, props) => {
  const variables = {teamId: props.teamId};
  return {
    actionSub: cashay.subscribe(actionsSubString, subscriber, {op: 'actionSub', variables})
  };
};

const UserActionListContainer = (props) => {
  const {actionSub} = props;
  const {actions} = actionSub.data;
  const sortedActions = actions.sort((a, b) => a.userSort > b.userSort);
  return <UserActionList actions={sortedActions}/>;
};

UserActionListContainer.propTypes = {
  actionSub: PropTypes.object,
};

export default connect(mapStateToProps)(UserActionListContainer);
