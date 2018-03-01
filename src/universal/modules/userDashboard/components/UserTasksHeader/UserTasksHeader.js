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

// <DashSectionHeading label="My Tasks" />

const UserTasksHeader = (props) => {
  const {dispatch, styles, teams, teamFilterId, teamFilterName} = props;
  const toggle = <DashFilterToggle label={teamFilterName} />;
  // TODO refactor so we can pull teams from the relay cache instead of feeding it down a long tree
  return (
    <DashSectionHeader>
      <DashSectionControls>
        {/* TODO: needs minimal, inline dropdown */}
        <DashSectionControl>
          <div className={css(styles.filterRow)}>
            <b style={inlineBlock}>Show Tasks for</b><span style={inlineBlock}>:</span>
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

UserTasksHeader.propTypes = {
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

export default withStyles(styleThunk)(UserTasksHeader);
