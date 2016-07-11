import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';

import Helmet from 'react-helmet';
import {head} from 'universal/utils/clientOptions';

import NotificationBar from 'universal/components/NotificationBar/NotificationBar';

let styles = {};

const DashLayout = (props) => {
  const {
    children,
    notification,
    hasNotification,
    title
  } = props;

  return (
    <div className={styles.root}>
      <Helmet title={title} {...head} />
      {hasNotification &&
        <NotificationBar notification={notification} />
      }
      <div className={styles.main}>
        {children}
      </div>
    </div>
  );
};

DashLayout.propTypes = {
  children: PropTypes.any,
  notification: PropTypes.object,
  hasNotification: PropTypes.bool,
  title: PropTypes.string
};

DashLayout.defaultProps = {
  notification: {
    link: 'https://prbl.io/1v2b3n',
    linkLabel: 'Join Active Meeting',
    message: 'Product',
    timestamp: '12:32'
  },
  hasNotification: true,
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
