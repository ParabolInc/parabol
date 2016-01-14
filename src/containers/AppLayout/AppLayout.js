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
          <div className={styles.header}>
            <a className={styles.menuDrawerToggle} href="#" title="Toggle Menu">Toggle Menu</a>
            <a className={styles.userDrawerToggle} href="#" title="Toggle User Menu">Toggle User Menu</a>
            <h1 className={styles.heading}>Heading Label</h1>
          </div>
          <div className={styles.content}>
            <p>I am an app layout WIP.</p>
          </div>
        </div>
      </div>
    );
  }
}
