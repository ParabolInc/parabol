import PropTypes from 'prop-types';
import React from 'react';
import {cashay} from 'cashay';
import {getAuthQueryString, getAuthedOptions} from 'universal/redux/getAuthedUser';
import {connect} from 'react-redux';
import StandardHub from 'universal/components/StandardHub/StandardHub';
import {withRouter} from 'react-router-dom';

const notificationsQuery = `
query {
  notifications(userId: $userId) @live {
    id
    startAt
    type
    varList
  }
}`;

const mapStateToProps = (state) => {
  const userId = state.auth.obj.sub;
  const {user} = cashay.query(getAuthQueryString, getAuthedOptions(userId)).data;

  const {notifications} = cashay.query(notificationsQuery, {
    op: 'standardHubContainer',
    sort: {
      notifications: (a, b) => a.startAt > b.startAt ? 1 : -1
    },
    variables: {
      userId: state.auth.obj.sub
    }
  }).data;

  return {
    notificationCount: notifications.length,
    user
  };
};

const StandardHubContainer = (props) => {
  const {history, notificationCount, user: {picture, preferredName, email}} = props;
  return (
    <StandardHub
      email={email}
      notificationCount={notificationCount}
      picture={picture}
      preferredName={preferredName}
      history={history}
    />
  );
};

StandardHubContainer.propTypes = {
  notificationCount: PropTypes.number,
  user: PropTypes.shape({
    email: PropTypes.string,
    picture: PropTypes.string,
    preferredName: PropTypes.string
  }).isRequired
};

export default withRouter(connect(mapStateToProps)(StandardHubContainer));
