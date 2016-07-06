import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';

import Helmet from 'react-helmet';
import {head} from 'universal/utils/clientOptions';

import NotificationBar from 'universal/components/NotificationBar/NotificationBar';

let styles = {};

const DashLayout = (props) =>
  <div className={styles.root}>
    <Helmet title={props.title} {...head} />
    {props.hasNotification &&
      <NotificationBar>
        {props.notification.message}
      </NotificationBar>
    }
    <div className={styles.main}>
      {props.children}
    </div>
  </div>;

DashLayout.propTypes = {
  children: PropTypes.any,
  notification: PropTypes.object,
  hasNotification: PropTypes.bool,
  title: PropTypes.string
};

DashLayout.defaultProps = {
  notification: {
    message: 'This bar alerts you when your team is meeting!'
  },
  hasNotification: false,
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
