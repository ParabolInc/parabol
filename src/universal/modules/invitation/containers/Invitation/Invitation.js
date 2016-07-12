import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import {getAuthQueryString, authedOptions} from 'universal/redux/getAuthedUser';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';

const getInvitationsByToken = `
query {
  user: getCurrentUser {
`;

const mapStateToProps = (state, props) => {
  const {params: {id}} = props;
  return {
    authToken: state.authToken,
    inviteTokenId: id,
    invitation:
    user: cashay.query(getAuthQueryString, authedOptions).data.user
  };
};

const Invitation = (props) => {
  console.log(props);
  return (
    <div>
      <h1>Hey! Welcome.</h1>
      <h2>We're going to design a landing page here for you soon.</h2>
    </div>
  );
};

Invitation.propTypes = {
  inviteTokenId: PropTypes.string.isRequired,
  user: PropTypes.object
};

// TODO: add route

export default connect(mapStateToProps)(
  requireAuth(Invitation)
);
