import React, {PropTypes} from 'react';
import {
  DashContent,
  DashHeader,
  DashHeaderInfo,
  DashMain,
  DashPanelHeading,
  dashTimestamp
} from 'universal/components/Dashboard';
import look, {StyleSheet} from 'react-look';
// import theme from 'universal/styles/theme';
import UserActions from 'universal/modules/userDashboard/components/UserActions/UserActions';
import UserColumnsContainer from 'universal/modules/userDashboard/containers/UserColumns/UserColumnsContainer';
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
      <DashContent>
        <div className={styles.root}>
          <div className={styles.actionsLayout}>
            <UserActions />
          </div>
          <div className={styles.projectsLayout}>
            <DashPanelHeading icon="calendar" label="My Projects" />
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
    padding: '1rem',
    width: '100%'
  },

  actionsLayout: {
    width: '20%'
  },

  projectsLayout: {
    display: 'flex',
    flexDirection: 'column',
    width: '80%'
  },

  crayCrayHover: {
    color: 'inherit',

    // TODO: Play with cray cray hover some more (TA)
    // ':hover': {
    //   color: theme.palette.warm,
    //   position: 'fixed',
    //   transform: 'scale(10)'
    // },
    // ':focus': {
    //   color: theme.palette.warm,
    //   position: 'fixed',
    //   transform: 'scale(10)'
    // }
  }
});

export default look(UserDashboard);
