import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import UserActionListItem from 'universal/modules/userDashboard/components/UserActionList/UserActionListItem';

const mapStateToProps = (state, props) => {
  const form = state.form[props.form];
  return {
    isActive: form && form.active === props.actionId
  };
};

const UserActionListItemContainer = (props) => {
  return <UserActionListItem {...props}/>;
};

UserActionListItemContainer.propTypes = {
  isActive: PropTypes.bool,
};

export default connect(mapStateToProps)(UserActionListItemContainer);
