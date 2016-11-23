import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import {
  DashSectionControl,
  DashSectionControls,
  DashSectionHeader,
  DashSectionHeading
} from 'universal/components/Dashboard';
import FontAwesome from 'react-fontawesome';
import {Menu, MenuItem} from 'universal/modules/menu';
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
  const {dispatch, styles, teams, teamFilterId, teamFilterName} = props;
  const toggle = (label) =>
    <div className={css(styles.button)} title={`Filter by ${label}`}>
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
          <Menu
            label="Filter by:"
            menuKey="UserDashFilterTeam"
            menuOrientation="right"
            toggle={toggle(teamFilterName)}
            toggleHeight={ui.dashSectionHeaderLineHeight}
            verticalAlign="top"
            zIndex="500"
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
          </Menu>
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
  button: {
    ...inlineBlock,
    color: appTheme.palette.mid,

    ':hover': {
      color: appTheme.palette.dark
    },
    ':focus': {
      color: appTheme.palette.dark
    }
  }
});

export default withStyles(styleThunk)(UserProjectsHeader);
