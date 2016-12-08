import React, {PropTypes} from 'react';

const UserDashboard = (props) => {
  // keep this route so we can treat /me/foo as a child of /me in the router
  return props.children;
};

UserDashboard.propTypes = {
  children: PropTypes.any
};

export default UserDashboard;
