import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import {NavLink, withRouter} from 'react-router-dom';
import DashFilterLabel from 'universal/components/DashFilterLabel/DashFilterLabel';
import DashFilterToggle from 'universal/components/DashFilterToggle/DashFilterToggle';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import LoadableTeamDashTeamMemberMenu from 'universal/components/LoadableTeamDashTeamMemberMenu';
import LoadableMenu from 'universal/components/LoadableMenu';
import styled, {css} from 'react-emotion';
import DashNavControl from 'universal/components/DashNavControl/DashNavControl';
import LabelHeading from 'universal/components/LabelHeading/LabelHeading';
import DashSectionHeader from 'universal/components/Dashboard/DashSectionHeader';
import DashHeading from 'universal/components/Dashboard/DashHeading';
import DashSectionControls from 'universal/components/Dashboard/DashSectionControls';
import DashSectionControl from 'universal/components/Dashboard/DashSectionControl';

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
};

const OrgInfoBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  fontSize: appTheme.typography.s2,
  lineHeight: appTheme.typography.s5,
  marginTop: '.125rem'
});

const orgLinkStyles = css({
  color: ui.linkColor,
  cursor: 'pointer',
  ':hover, :focus': {
    color: ui.linkColorHover
  }
});

const TeamTasksHeader = (props) => {
  const {history, teamMemberFilterId, teamMemberFilterName, team} = props;
  const {organization, teamId, teamName} = team;
  const {orgName, orgId} = organization;
  return (
    <DashSectionHeader>
      <div>
        <LabelHeading>{'Team Dashboard'}</LabelHeading>
        <DashHeading>{`${teamName} Tasks`}</DashHeading>
        <OrgInfoBlock>
          <NavLink className={orgLinkStyles} title={orgName} to={`/me/organizations/${orgId}`}>
            {orgName}
          </NavLink>
        </OrgInfoBlock>
      </div>
      <DashSectionControls>
        {/* Archive Link */}
        <DashNavControl
          icon="archive"
          label="See Archived Tasks"
          onClick={() => history.push(`/team/${teamId}/archive`)}
        />

        {/* Filter by Owner */}
        <DashSectionControl>
          <DashFilterLabel>
            <b>{'Show Tasks for'}</b>
            {': '}
          </DashFilterLabel>
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
      organization {
        orgId: id
        orgName: name
      }
      ...TeamDashTeamMemberMenu_team
    }
  `
);
