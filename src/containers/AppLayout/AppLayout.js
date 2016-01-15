import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { NotificationBar, MenuDrawer, UserDrawer, ListFilterSet, TaskList } from 'components';

const styles = require('./AppLayout.scss'); // eslint-disable-line

export default class AppLayout extends Component {
  render() {
    const handleMenuDrawerToggle = (event) => {
      event.preventDefault();
      console.log('handleMenuDrawerToggle');
    };

    const handleUserDrawerToggle = (event) => {
      event.preventDefault();
      console.log('handleUserDrawerToggle');
    };

    return (
      <div className={styles.main}>
        <Helmet title="App Layout" />
        <NotificationBar />
        <div className={styles.inner}>
          <UserDrawer />
          <MenuDrawer />
          <div className={styles.header}>
            <a className={styles.menuDrawerToggle} href="#" onClick={handleMenuDrawerToggle} title="Toggle Menu Drawer">M</a>
            <a className={styles.userDrawerToggle} href="#" onClick={handleUserDrawerToggle} title="Toggle User Drawer">U</a>
            <h1 className={styles.heading}>Heading Label</h1>
          </div>
          <div className={styles.content}>
            <p>I am an app layout WIP.</p>
            <ListFilterSet />
            <TaskList />
          </div>
        </div>
      </div>
    );
  }
}
