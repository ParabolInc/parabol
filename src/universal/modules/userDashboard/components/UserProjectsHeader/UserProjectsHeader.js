import React, {PropTypes} from 'react';
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

const inlineBlock = {
  display: 'inline-block',
  height: ui.dashSectionHeaderLineHeight,
  lineHeight: ui.dashSectionHeaderLineHeight,
  verticalAlign: 'middle'
};

const UserProjectsHeader = (props) => {
  const {dispatch, teams, teamFilterId, teamFilterName} = props;
  return (
    <DashSectionHeader>
      <DashSectionHeading icon="calendar" label="My Projects" />
      <DashSectionControls>
        {/* TODO: needs minimal, inline dropdown */}
        <DashSectionControl>
          <b style={inlineBlock}>Show Actions & Projects for</b><span style={inlineBlock}>:</span>
          {' '}
          {/*<Menu*/}
            {/*label="Filter by:"*/}
            {/*menuKey="UserDashFilterTeam"*/}
            {/*menuOrientation="right"*/}
            {/*toggle={DashFilterToggle}*/}
            {/*toggleLabel={teamFilterName}*/}
            {/*toggleHeight={ui.dashSectionHeaderLineHeight}*/}
            {/*verticalAlign="top"*/}
            {/*zIndex="500"*/}
          {/*>*/}
            {/*<MenuItem*/}
              {/*isActive={teamFilterId === null}*/}
              {/*key={'teamFilterNULL'}*/}
              {/*label={'All teams'}*/}
              {/*onClick={() => dispatch(filterTeam(null, 'All teams'))}*/}
            {/*/>*/}
            {/*{teams.map((team) =>*/}
              {/*<MenuItem*/}
                {/*isActive={team.id === teamFilterId}*/}
                {/*key={`teamFilter${team.id}`}*/}
                {/*label={team.name}*/}
                {/*onClick={() => dispatch(filterTeam(team.id, team.name))}*/}
              {/*/>*/}
            {/*)}*/}
          {/*</Menu>*/}
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

export default UserProjectsHeader;
