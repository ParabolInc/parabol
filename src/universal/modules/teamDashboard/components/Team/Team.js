import React, {PropTypes} from 'react';

import Helmet from 'react-helmet';
import {head} from 'universal/utils/clientOptions';

import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';

import DashContent from 'universal/components/DashContent/DashContent';
import DashHeader from 'universal/components/DashHeader/DashHeader';
import DashSidebar from 'universal/components/DashSidebar/DashSidebar';
import NotificationBar from 'universal/components/NotificationBar/NotificationBar';

let styles = {};

const Team = (props) => {
  const {dispatch, user} = props;
  const activeTeamId = props.urlParams.id;

  return (
    <div className={styles.viewport}>
      <Helmet title="Action Dashboard" {...head} />
      <NotificationBar>
        Notified!
      </NotificationBar>
      <div className={styles.main}>
        <div className={styles.sidebar}>
          <DashSidebar
            activeTeamId={activeTeamId}
            dispatch={dispatch}
            user={user}
          />
        </div>
        <div className={styles.content}>
          <DashHeader title="My Outcomes" meta="Tuesday, June 21 • Carpe diem!" />
          <DashContent>
            Dashboard Content
          </DashContent>
        </div>
      </div>
    </div>
  );
};

Team.propTypes = {
  dispatch: PropTypes.func.isRequired,
  urlParams: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired,
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

export default look(Team);
