import PropTypes from 'prop-types';
import React from 'react';
import {cashay} from 'cashay';
import {getAuthQueryString, getAuthedOptions} from 'universal/redux/getAuthedUser';
import {connect} from 'react-redux';
import StandardHub from 'universal/components/StandardHub/StandardHub';
import {withRouter} from 'react-router-dom';

const mapStateToProps = (state) => {
  const userId = state.auth.obj.sub;
  const {user} = cashay.query(getAuthQueryString, getAuthedOptions(userId)).data;
  return {
    user
  };
};

const StandardHubContainer = (props) => {
  const {history, notificationsCount, user: {picture, preferredName, email}, viewer} = props;
  return (
    <StandardHub
      email={email}
      notificationsCount={notificationsCount}
      picture={picture}
      preferredName={preferredName}
      history={history}
      viewer={viewer}
    />
  );
};

StandardHubContainer.propTypes = {
  history: PropTypes.object.isRequired,
  notificationsCount: PropTypes.number,
  user: PropTypes.shape({
    email: PropTypes.string,
    picture: PropTypes.string,
    preferredName: PropTypes.string
  }).isRequired,
  viewer: PropTypes.object
};

// router required to update nested content on route changes
export default withRouter(connect(mapStateToProps)(StandardHubContainer));
