import React, {PropTypes} from 'react';
import {Link} from 'react-router';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
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
  const {styles, teamId} = props;
  return (
    <DashSectionHeader>
      <DashSectionHeading icon="calendar" label="Team Projects" />
      <DashSectionControls>
        {/* TODO: needs link to archive */}
        <DashSectionControl>
          <FontAwesome name="archive" style={iconStyle} />
          <Link className={css(styles.link)} to={`/team/${teamId}/archive`}>
            See Archived Projects
          </Link>
        </DashSectionControl>
        {/* TODO: needs minimal, inline dropdown */}
        <DashSectionControl>
          <b style={ib}>Show by Team Member</b>:
          {' '}
          <a className={css(styles.link)} href="#" title="Filter by All Team Members">
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
  styles: PropTypes.object,
  teamId: PropTypes.string,
};

const styleThunk = () => ({
  link: {
    ...ib,
    color: appTheme.palette.mid,

    ':hover': {
      color: appTheme.palette.dark
    },
    ':focus': {
      color: appTheme.palette.dark
    }
  }
});

export default withStyles(styleThunk)(TeamProjectsHeader);
