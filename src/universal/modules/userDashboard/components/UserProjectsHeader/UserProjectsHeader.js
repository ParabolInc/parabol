import PropTypes from 'prop-types';
import React from 'react';
import ui from 'universal/styles/ui';
import {
  DashSectionControl,
  DashSectionControls,
  DashSectionHeader,
  DashSectionHeading
} from 'universal/components/Dashboard';
import {Menu, MenuItem} from 'universal/modules/menu';
import {filterTeam} from 'universal/modules/userDashboard/ducks/userDashDuck';
import DashFilterToggle from 'universal/components/DashFilterToggle/DashFilterToggle';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';

import NewMenu, {
  MenuItemButton as NewMenuItemButton,
  MenuLabel as NewMenuLabel
} from 'universal/components/Menu/Menu';


const inlineBlock = {
  display: 'inline-block',
  height: ui.dashSectionHeaderLineHeight,
  lineHeight: ui.dashSectionHeaderLineHeight,
  verticalAlign: 'middle'
};

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
};

const UserProjectsHeader = (props) => {
  const {dispatch, styles, teams, teamFilterId, teamFilterName} = props;
  const toggle = <DashFilterToggle label={teamFilterName} />;
  // TODO refactor so we can pull teams from the relay cache instead of feeding it down a long tree
  return (
    <DashSectionHeader>
      <DashSectionHeading icon="calendar" label="My Projects" />
      <DashSectionControls>
        {/* TODO: needs minimal, inline dropdown */}
        <DashSectionControl>
          <div className={css(styles.filterRow)}>
            <b style={inlineBlock}>Show Projects for</b><span style={inlineBlock}>:</span>
            {' '}
            <Menu
              label="Filter by:"
              maxHeight={ui.dashMenuHeight}
              menuWidth={ui.dashMenuWidth}
              originAnchor={originAnchor}
              targetAnchor={targetAnchor}
              toggle={toggle}
            >
              <MenuItem
                isActive={teamFilterId === null}
                key={'teamFilterNULL'}
                label={'All teams'}
                onClick={() => dispatch(filterTeam(null))}
              />
              {teams.map((team) =>
                (<MenuItem
                  isActive={team.id === teamFilterId}
                  key={`teamFilter${team.id}`}
                  label={team.name}
                  onClick={() => dispatch(filterTeam(team.id, team.name))}
                />)
              )}
            </Menu>
          </div>
        </DashSectionControl>
      </DashSectionControls>
    </DashSectionHeader>
  );
};

const NewUserProjectsHeader = (props) => {
  const {dispatch, styles, teams, teamFilterId, teamFilterName} = props;
  const toggle = <DashFilterToggle label={teamFilterName} />;
  // TODO refactor so we can pull teams from the relay cache instead of feeding it down a long tree
  const menu = (
    <NewMenu toggle={toggle} menuWidth={ui.dashMenuWidth}>
      <NewMenuLabel>Filter By:</NewMenuLabel>
      <NewMenuItemButton
        isActive={teamFilterId === null} // TODO support this prop
        onClick={() => dispatch(filterTeam(null))}
      >
        All teams
      </NewMenuItemButton>
      {teams.map((team) => (
        <NewMenuItemButton
          isActive={team.id === teamFilterId} // TODO support this prop
          key={`teamFilter${team.id}`}
          onClick={() => dispatch(filterTeam(team.id, team.name))}
        >
          {team.name}
        </NewMenuItemButton>
      ))}
    </NewMenu>
  );
  return (
    <DashSectionHeader>
      <DashSectionHeading icon="calendar" label="My Projects" />
      <DashSectionControls>
        {/* TODO: needs minimal, inline dropdown */}
        <DashSectionControl>
          <div className={css(styles.filterRow)}>
            <b style={inlineBlock}>Show Projects for</b><span style={inlineBlock}>:</span>
            {' '}
            {menu}
          </div>
        </DashSectionControl>
      </DashSectionControls>
    </DashSectionHeader>
  );
};

UserProjectsHeader.propTypes = {
  children: PropTypes.any,
  dispatch: PropTypes.func,
  styles: PropTypes.object,
  teams: PropTypes.array,
  teamFilterId: PropTypes.string,
  teamFilterName: PropTypes.string
};

const styleThunk = () => ({
  filterRow: {
    display: 'flex',
    justifyContent: 'flex-end'
  }
});

export default withStyles(styleThunk)(
  !__RELEASE_FLAGS__.newMenu
    ? NewUserProjectsHeader
    : UserProjectsHeader
);
