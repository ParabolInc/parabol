import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';

import Helmet from 'react-helmet';
import {head} from 'universal/utils/clientOptions';

import NotificationBar from 'universal/components/NotificationBar/NotificationBar';

let styles = {};

const DashLayout = (props) => {
  const {
    activeMeetings,
    children,
    notification,
    title
  } = props;
  const hasNotification = activeMeetings.length > 0;
  return (
    <div className={styles.root}>
      <Helmet title={title} {...head} />
      {hasNotification &&
        <NotificationBar activeMeetings={activeMeetings} notification={notification} />
      }
      <div className={styles.main}>
        {children}
      </div>
    </div>
  );
};

DashLayout.propTypes = {
  activeMeetings: PropTypes.array.isRequired,
  children: PropTypes.any,
  notification: PropTypes.object,
  title: PropTypes.string
};

DashLayout.defaultProps = {
  notification: {
    link: '/meeting/team123',
    linkLabel: 'Join Active Meeting',
    message: 'Product',
    timestamp: '12:32'
  },
  title: 'Action Dashboard'
};

styles = StyleSheet.create({
  root: {
    backgroundColor: '#fff',
    display: 'flex !important',
    flexDirection: 'column',
    minHeight: '100vh'
  },

  main: {
    display: 'flex !important',
    flex: 1
  },
});

export default look(DashLayout);
