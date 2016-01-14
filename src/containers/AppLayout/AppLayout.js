import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { NotificationBar } from 'components';
import { MenuDrawer } from 'components';
import { UserDrawer } from 'components';

const styles = require('./AppLayout.scss'); // eslint-disable-line

export default class AppLayout extends Component {
  render() {
    return (
      <div className={styles.main}>
        <Helmet title="App Layout" />
        <NotificationBar />
        <div className={styles.inner}>
          <UserDrawer />
          <MenuDrawer />
          <h1 className={styles.heading}>Heading Label</h1>
          <p>I am an app layout WIP.</p>
        </div>
      </div>
    );
  }
}
