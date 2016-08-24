import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {DashPanelHeading} from 'universal/components/Dashboard';

const TeamProjectsHeader = () => {
  const {styles} = TeamProjectsHeader;
  return (
    <div className={styles.root}>
      <div className={styles.heading}>
        <DashPanelHeading icon="check" label="Team Projects" />
      </div>
      <div className={styles.controls}>
        Show by team member: ALL TEAM MEMBERS
      </div>
    </div>
  );
};

TeamProjectsHeader.propTypes = {
  // TODO
  children: PropTypes.any
};

TeamProjectsHeader.styles = StyleSheet.create({
  root: {
    display: 'flex',
    flex: 1,
    // padding: '1rem',
    width: '100%'
  },

  heading: {
    // display: 'none'
  },

  controls: {
    flex: 1,
    textAlign: 'right'
  }
});

export default look(TeamProjectsHeader);
