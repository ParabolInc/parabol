import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import {getAuthQueryString, authedOptions} from 'universal/redux/getAuthedUser';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';

const mapStateToProps = (state, props) => {
  const {params: {id}} = props;
  return {
    authToken: state.authToken,
    inviteTokenId: id,
    user: cashay.query(getAuthQueryString, authedOptions).data.user
  };
};

const Invitation = (props) => {
  console.log(props);
  return (<div/>);
};

Invitation.propTypes = {
  inviteTokenId: PropTypes.string.isRequired,
  user: PropTypes.object
};

// TODO: add route

export default connect(mapStateToProps)(
  requireAuth(Invitation)
);
