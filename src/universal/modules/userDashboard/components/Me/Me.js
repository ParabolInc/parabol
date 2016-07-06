import React, {PropTypes} from 'react';

import Helmet from 'react-helmet';
import {head} from 'universal/utils/clientOptions';

import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';

import Outcomes from 'universal/modules/userDashboard/components/Outcomes/Outcomes';
import Settings from 'universal/modules/userDashboard/components/Preferences/Preferences';

import DashSidebar from 'universal/components/DashSidebar/DashSidebar';
import NotificationBar from 'universal/components/NotificationBar/NotificationBar';

let styles = {};

const Me = (props) => {
  const {dispatch, location} = props;
  return (
    <div className={styles.viewport}>
      <Helmet title="Action Dashboard" {...head} />
      <NotificationBar>
        Notified!
      </NotificationBar>
      <div className={styles.main}>
        <div className={styles.sidebar}>
          <DashSidebar dispatch={dispatch} user={props.user} />
        </div>
        <div className={styles.content}>
          {location === '/me' && <Outcomes {...props} />}
          {location === '/me/settings' && <Settings {...props} />}
        </div>
      </div>
    </div>
  );
};

Me.propTypes = {
  dispatch: PropTypes.func.isRequired,
  location: PropTypes.string,
  user: PropTypes.shape({
    name: PropTypes.string,
    nickname: PropTypes.string,
    memberships: PropTypes.array
  })
};

styles = StyleSheet.create({
  viewport: {
    backgroundColor: '#fff',
    display: 'flex !important',
    flexDirection: 'column',
    minHeight: '100vh'
  },

  main: {
    display: 'flex !important',
    flex: 1
  },

  sidebar: {
    backgroundColor: theme.palette.mid,
    color: theme.palette.mid10l,
    width: '15rem'
  },

  content: {
    display: 'flex !important',
    flex: 1,
    flexDirection: 'column'
  }
});

export default look(Me);
