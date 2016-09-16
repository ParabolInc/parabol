import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import ib from 'universal/styles/helpers/ib';
import {DashPanelHeading} from 'universal/components/Dashboard';
import FontAwesome from 'react-fontawesome';

const TeamProjectsHeader = () => {
  const {styles} = TeamProjectsHeader;
  return (
    <div className={styles.root}>
      <div className={styles.heading}>
        <DashPanelHeading icon="calendar" label="Team Projects" />
      </div>
      <div className={styles.controls}>
        {/* TODO: needs link to archive */}
        <div className={styles.control}>
          <FontAwesome name="archive" style={ib} />
          {' '}
          <a className={styles.link} href="#" title="See Archived Projects">
            See Archived Projects
          </a>
        </div>
        {/* TODO: needs minimal, inline dropdown */}
        <div className={styles.control}>
          <b>Show by Team Member</b>:
          {' '}
          <a className={styles.link} href="#" title="See Archived Projects">
            All Team Members
          </a>
          {' '}
          <FontAwesome name="arrow-circle-down" style={ib} />
        </div>
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
    padding: '1rem',
    width: '100%'
  },

  heading: {
    // Define
  },

  controls: {
    flex: 1,
    lineHeight: '27px', // #shame
    textAlign: 'right'
  },

  control: {
    ...ib,
    color: theme.palette.mid,
    fontSize: theme.typography.s3,
    marginLeft: '2rem'
  },

  link: {
    ...ib,
    color: theme.palette.mid
  }
});

export default look(TeamProjectsHeader);
