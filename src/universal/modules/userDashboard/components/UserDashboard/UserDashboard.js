import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import layout from 'universal/styles/layout';
import ui from 'universal/styles/ui';
import {
  DashContent,
  DashHeader,
  DashHeaderInfo,
  DashMain,
  dashTimestamp
} from 'universal/components/Dashboard';
import UserActions from 'universal/modules/userDashboard/components/UserActions/UserActions';
import UserColumnsContainer from 'universal/modules/userDashboard/containers/UserColumns/UserColumnsContainer';
import UserProjectsHeader from '../UserProjectsHeader/UserProjectsHeader';
import getRallyLink from '../../helpers/getRallyLink';

const UserDashboard = () => {
  const {styles} = UserDashboard;
  return (
    <DashMain>
      <DashHeader>
        <DashHeaderInfo title="My Dashboard">
          {dashTimestamp} • <span className={styles.crayCrayHover}>{getRallyLink()}!</span>
        </DashHeaderInfo>
      </DashHeader>
      <DashContent padding="0">
        <div className={styles.root}>
          <div className={styles.actionsLayout}>
            <UserActions />
          </div>
          <div className={styles.projectsLayout}>
            <UserProjectsHeader />
            <UserColumnsContainer/>
          </div>
        </div>
      </DashContent>
    </DashMain>
  );
};

UserDashboard.propTypes = {
  projects: PropTypes.array
};

UserDashboard.styles = StyleSheet.create({
  root: {
    display: 'flex',
    flex: 1,
    width: '100%'
  },

  actionsLayout: {
    boxSizing: 'content-box',
    borderRight: `2px solid ${ui.dashBorderColor}`,
    display: 'flex',
    flexDirection: 'column',
    width: layout.dashActionsWidth
  },

  projectsLayout: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    paddingLeft: '1rem'
  },

  crayCrayHover: {
    color: 'inherit'
  }
});

export default look(UserDashboard);
