import React, {PropTypes} from 'react';
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

const UserProjectsHeader = () => {
  const {styles} = UserProjectsHeader;
  return (
    <DashSectionHeader>
      <DashSectionHeading icon="calendar" label="My Projects" />
      <DashSectionControls>
        {/* TODO: needs minimal, inline dropdown */}
        <DashSectionControl>
          <b style={ib}>Show Actions & Projects for</b>:
          {' '}
          <a className={styles.link} href="#" title="Filter by All Teams">
            All Teams
          </a>
          {' '}
          <FontAwesome name="chevron-circle-down" style={ib} />
        </DashSectionControl>
      </DashSectionControls>
    </DashSectionHeader>
  );
};

UserProjectsHeader.propTypes = {
  children: PropTypes.any
};

UserProjectsHeader.styles = StyleSheet.create({
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

export default look(UserProjectsHeader);
