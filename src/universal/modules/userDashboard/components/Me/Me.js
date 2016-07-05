import React, {PropTypes} from 'react';

import Helmet from 'react-helmet';
import {head} from 'universal/utils/clientOptions';

import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';

import DashColumns from 'universal/components/DashColumns/DashColumns';
import DashContent from 'universal/components/DashContent/DashContent';
import DashHeader from 'universal/components/DashHeader/DashHeader';
import DashSidebar from 'universal/components/DashSidebar/DashSidebar';
import dashTimestamp from 'universal/components/DashTimestamp/DashTimestamp';
import NotificationBar from 'universal/components/NotificationBar/NotificationBar';

let styles = {};

const Me = (props) => {
  const {name, nickname, memberships} = props.user;
  return (
    <div className={styles.viewport}>
      <Helmet title="Action Dashboard" {...head} />
      <NotificationBar>
        Notified!
      </NotificationBar>
      <div className={styles.main}>
        <div className={styles.sidebar}>
          <DashSidebar user={props.user} teams={memberships} />
        </div>
        <div className={styles.content}>
          <DashHeader title="My Outcomes" meta={`${dashTimestamp} • Carpe diem!`} />
          <DashContent>
            It’s the Me show! starring: <b>{name}</b>, AKA <b>{nickname}</b>
            <DashColumns />
          </DashContent>
        </div>
      </div>
    </div>
  );
};

Me.propTypes = {
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
