import React, {PropTypes} from 'react';
import {cashay} from 'cashay';
import {getAuthQueryString, getAuthedOptions} from 'universal/redux/getAuthedUser';
import {connect} from 'react-redux';
import StandardHub from 'universal/components/StandardHub/StandardHub';

const mapStateToProps = (state) => {
  const userId = state.auth.obj.sub;
  const {user} = cashay.query(getAuthQueryString, getAuthedOptions(userId)).data;
  return {
    user
  };
};

const StandardHubContainer = (props) => {
  const {picture, preferredName, email} = props.user;
  return (
    <StandardHub picture={picture} preferredName={preferredName} email={email}/>
  );
};

StandardHubContainer.propTypes = {
  user: PropTypes.shape({
    email: PropTypes.string,
    picture: PropTypes.string,
    preferredName: PropTypes.string
  }).isRequired
};

export default connect(mapStateToProps)(StandardHubContainer);
