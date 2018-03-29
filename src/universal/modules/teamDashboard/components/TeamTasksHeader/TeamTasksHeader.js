import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import {withRouter} from 'react-router-dom';
import {
  DashSectionControl,
  DashSectionControls,
  DashSectionHeader,
  DashHeading
} from 'universal/components/Dashboard';
import {DashNavControl, LabelHeading} from 'universal/components';
import DashFilterLabel from 'universal/components/DashFilterLabel/DashFilterLabel';
import DashFilterToggle from 'universal/components/DashFilterToggle/DashFilterToggle';
import {Menu, MenuItem} from 'universal/modules/menu';
import {filterTeamMember} from 'universal/modules/teamDashboard/ducks/teamDashDuck';
import ui from 'universal/styles/ui';

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
};

const TeamTasksHeader = (props) => {
  const {dispatch, history, teamMemberFilterId, teamMemberFilterName, team} = props;
  const {teamId, teamMembers, teamName} = team;
  // portal HOC warns about refs on the stateless component, wrapping in div (TA)
  const toggle = (
    <div>
      <DashFilterToggle label={teamMemberFilterName} />
    </div>
  );

  const itemFactory = () => {
    return [<MenuItem
      isActive={teamMemberFilterId === null}
      key={'teamMemberFilterNULL'}
      label={'All members'}
      onClick={() => dispatch(filterTeamMember(null))}
    />].concat(
      teamMembers.map((teamMember) =>
        (<MenuItem
          isActive={teamMember.id === teamMemberFilterId}
          key={`teamMemberFilter${teamMember.id}`}
          label={teamMember.preferredName}
          onClick={() => dispatch(filterTeamMember(teamMember.id, teamMember.preferredName))}
        />)
      ));
  };

  const goToArchive = () => history.push(`/team/${teamId}/archive`);

  return (
    <DashSectionHeader>
      <div>
        <LabelHeading>{'Team Dashboard'}</LabelHeading>
        <DashHeading>
          {`${teamName} Tasks`}
        </DashHeading>
      </div>
      <DashSectionControls>

        {/* Archive Link */}
        <DashNavControl
          icon="archive"
          label="See Archived Tasks"
          onClick={goToArchive}
        />

        {/* Filter by Owner */}
        <DashSectionControl>
          <DashFilterLabel><b>{'Show Tasks for'}</b>{': '}</DashFilterLabel>
          <Menu
            itemFactory={itemFactory}
            label="Filter by:"
            maxHeight={ui.dashMenuHeight}
            toggle={toggle}
            originAnchor={originAnchor}
            targetAnchor={targetAnchor}
          />
        </DashSectionControl>
      </DashSectionControls>
    </DashSectionHeader>
  );
};

TeamTasksHeader.propTypes = {
  children: PropTypes.any,
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object,
  team: PropTypes.object.isRequired,
  teamMemberFilterId: PropTypes.string,
  teamMemberFilterName: PropTypes.string
};

export default createFragmentContainer(
  withRouter(TeamTasksHeader),
  graphql`
    fragment TeamTasksHeader_team on Team {
      teamId: id
      teamName: name
      teamMembers(sortBy: "preferredName") {
        id
        preferredName
      }
    }
  `
);
