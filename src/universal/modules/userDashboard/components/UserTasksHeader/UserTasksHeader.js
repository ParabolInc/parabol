import PropTypes from 'prop-types';
import React from 'react';
import ui from 'universal/styles/ui';
import {
  DashHeading,
  DashSectionControl,
  DashSectionControls,
  DashSectionHeader
} from 'universal/components/Dashboard';
import {Menu, MenuItem} from 'universal/modules/menu';
import {filterTeam} from 'universal/modules/userDashboard/ducks/userDashDuck';
import DashFilterLabel from 'universal/components/DashFilterLabel/DashFilterLabel';
import DashFilterToggle from 'universal/components/DashFilterToggle/DashFilterToggle';

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
};

const UserTasksHeader = (props) => {
  const {dispatch, teams, teamFilterId, teamFilterName} = props;
  // portal HOC warns about refs on the stateless component, wrapping in div (TA)
  const toggle = (
    <div>
      <DashFilterToggle label={teamFilterName} />
    </div>
  );
  // TODO refactor so we can pull teams from the relay cache instead of feeding it down a long tree
  return (
    <DashSectionHeader>
      <DashHeading>
        {'My Dashboard'}
      </DashHeading>
      <DashSectionControls>
        <DashSectionControl>
          <DashFilterLabel><b>{'Show Tasks for'}</b>{': '}</DashFilterLabel>
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
        </DashSectionControl>
      </DashSectionControls>
    </DashSectionHeader>
  );
};

UserTasksHeader.propTypes = {
  children: PropTypes.any,
  dispatch: PropTypes.func,
  teams: PropTypes.array,
  teamFilterId: PropTypes.string,
  teamFilterName: PropTypes.string
};

export default UserTasksHeader;
