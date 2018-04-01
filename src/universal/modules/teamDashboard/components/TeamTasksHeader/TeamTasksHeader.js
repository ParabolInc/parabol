import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import {withRouter} from 'react-router-dom';
import {DashHeading, DashSectionControl, DashSectionControls, DashSectionHeader} from 'universal/components/Dashboard';
import {DashNavControl, LabelHeading} from 'universal/components';
import DashFilterLabel from 'universal/components/DashFilterLabel/DashFilterLabel';
import DashFilterToggle from 'universal/components/DashFilterToggle/DashFilterToggle';
import ui from 'universal/styles/ui';
import LoadableTeamDashTeamMemberMenu from 'universal/components/LoadableTeamDashTeamMemberMenu';
import LoadableMenu from 'universal/components/LoadableMenu';

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
};

const TeamTasksHeader = (props) => {
  const {history, teamMemberFilterId, teamMemberFilterName, team} = props;
  const {teamId, teamName} = team;

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
          <LoadableMenu
            LoadableComponent={LoadableTeamDashTeamMemberMenu}
            maxWidth={350}
            maxHeight={parseInt(ui.dashMenuHeight, 10) * 16}
            originAnchor={originAnchor}
            queryVars={{
              team,
              teamMemberFilterId
            }}
            targetAnchor={targetAnchor}
            toggle={<DashFilterToggle label={teamMemberFilterName} />}
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
      ...TeamDashTeamMemberMenu_team
    }
  `
);
