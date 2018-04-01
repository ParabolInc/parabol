import PropTypes from 'prop-types';
import React from 'react';
import ui from 'universal/styles/ui';
import {DashHeading, DashSectionControl, DashSectionControls, DashSectionHeader} from 'universal/components/Dashboard';
import DashFilterLabel from 'universal/components/DashFilterLabel/DashFilterLabel';
import DashFilterToggle from 'universal/components/DashFilterToggle/DashFilterToggle';
import LoadableMenu from 'universal/components/LoadableMenu';
import LoadableUserDashTeamMenu from 'universal/components/LoadableUserDashTeamMenu';

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
};

const UserTasksHeader = (props) => {
  const {teams, teamFilterId, teamFilterName} = props;
  // TODO refactor so we can pull teams from the relay cache instead of feeding it down a long tree
  return (
    <DashSectionHeader>
      <DashHeading>
        {'My Dashboard'}
      </DashHeading>
      <DashSectionControls>
        <DashSectionControl>
          <DashFilterLabel><b>{'Show Tasks for'}</b>{': '}</DashFilterLabel>
          <LoadableMenu
            LoadableComponent={LoadableUserDashTeamMenu}
            maxWidth={350}
            maxHeight={parseInt(ui.dashMenuHeight, 10) * 16}
            originAnchor={originAnchor}
            queryVars={{
              teams,
              teamFilterId
            }}
            targetAnchor={targetAnchor}
            toggle={<DashFilterToggle label={teamFilterName} />}
          />
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
