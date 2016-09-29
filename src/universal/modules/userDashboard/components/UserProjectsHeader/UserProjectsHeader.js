import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import ui from 'universal/styles/ui';
import {
  DashSectionControl,
  DashSectionControls,
  DashSectionHeader,
  DashSectionHeading
} from 'universal/components/Dashboard';
import FontAwesome from 'react-fontawesome';
import {Menu, MenuToggle} from 'universal/components';

import exampleMenu from 'universal/modules/patterns/helpers/exampleMenu';

const inlineBlock = {
  display: 'inline-block',
  height: ui.dashSectionHeaderLineHeight,
  lineHeight: ui.dashSectionHeaderLineHeight,
  verticalAlign: 'middle'
};

const inlineBlockTop = {
  ...inlineBlock,
  verticalAlign: 'top'
};

const UserProjectsHeader = () => {
  const {styles} = UserProjectsHeader;
  const toggle = (label) =>
    <div className={styles.button} title={`Filter by ${label}`}>
      <span style={inlineBlockTop}>{label}</span> <FontAwesome name="chevron-circle-down" style={inlineBlockTop} />
    </div>;
  return (
    <DashSectionHeader>
      <DashSectionHeading icon="calendar" label="My Projects" />
      <DashSectionControls>
        {/* TODO: needs minimal, inline dropdown */}
        <DashSectionControl>
          <b style={inlineBlock}>Show Actions & Projects for</b><span style={inlineBlock}>:</span>
          {' '}
          <MenuToggle
            menuOrientation="right"
            toggle={toggle('All Teams')}
            toggleHeight={ui.dashSectionHeaderLineHeight}
            verticalAlign="top"
          >
            <Menu items={exampleMenu} label="Filter by:" />
          </MenuToggle>
        </DashSectionControl>
      </DashSectionControls>
    </DashSectionHeader>
  );
};

UserProjectsHeader.propTypes = {
  children: PropTypes.any
};

UserProjectsHeader.styles = StyleSheet.create({
  button: {
    ...inlineBlock,
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
