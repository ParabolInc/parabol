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
import {MenuToggle} from 'universal/components';
import MenuItem from 'universal/components/MenuItem/MenuItem';
import {filterTeam} from 'universal/modules/userDashboard/ducks/userDashDuck';


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

const UserProjectsHeader = (props) => {
  const {dispatch, teams, teamFilterId, teamFilterName} = props;
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
            label="Filter by:"
            menuOrientation="right"
            toggle={toggle(teamFilterName)}
            toggleHeight={ui.dashSectionHeaderLineHeight}
            verticalAlign="top"
          >
            <MenuItem
              isActive={teamFilterId === null}
              key={'teamFilterNULL'}
              label={'All teams'}
              onClick={() => dispatch(filterTeam(null, 'All teams'))}
            />
            {teams.map((team) =>
              <MenuItem
                isActive={team.id === teamFilterId}
                key={`teamFilter${team.id}`}
                label={team.name}
                onClick={() => dispatch(filterTeam(team.id, team.name))}
              />
            )}
          </MenuToggle>
        </DashSectionControl>
      </DashSectionControls>
    </DashSectionHeader>
  );
};

UserProjectsHeader.propTypes = {
  children: PropTypes.any,
  dispatch: PropTypes.func,
  teams: PropTypes.array,
  teamFilterId: PropTypes.string,
  teamFilterName: PropTypes.string
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
