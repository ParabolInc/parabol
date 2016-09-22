import React, {PropTypes} from 'react';
import {Link} from 'react-router';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import ib from 'universal/styles/helpers/ib';
import {
  DashSectionControl,
  DashSectionControls,
  DashSectionHeader,
  DashSectionHeading
} from 'universal/components/Dashboard';
import FontAwesome from 'react-fontawesome';

const iconStyle = {
  ...ib,
  margin: '0 .5rem 0 0'
};

const TeamProjectsHeader = (props) => {
  const {teamId} = props;
  const {styles} = TeamProjectsHeader;
  return (
    <DashSectionHeader>
      <DashSectionHeading icon="calendar" label="Team Projects" />
      <DashSectionControls>
        {/* TODO: needs link to archive */}
        <DashSectionControl>
          <FontAwesome name="archive" style={iconStyle} />
          <Link className={styles.link} to={`/team/${teamId}/archive`}>
            See Archived Projects
          </Link>
        </DashSectionControl>
        {/* TODO: needs minimal, inline dropdown */}
        <DashSectionControl>
          <b style={ib}>Show by Team Member</b>:
          {' '}
          <a className={styles.link} href="#" title="Filter by All Team Members">
            All Team Members
          </a>
          {' '}
          <FontAwesome name="chevron-circle-down" style={ib} />
        </DashSectionControl>
      </DashSectionControls>
    </DashSectionHeader>
  );
};

TeamProjectsHeader.propTypes = {
  children: PropTypes.any,
  teamId: PropTypes.string,
};

TeamProjectsHeader.styles = StyleSheet.create({
  link: {
    ...ib,
    color: theme.palette.mid,

    ':hover': {
      color: theme.palette.dark
    },
    ':focus': {
      color: theme.palette.dark
    }
  }
});

export default look(TeamProjectsHeader);
