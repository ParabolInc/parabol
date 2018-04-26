import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import {NavLink, withRouter} from 'react-router-dom';
import {DashHeading, DashSectionControl, DashSectionControls, DashSectionHeader} from 'universal/components/Dashboard';
import {DashNavControl, LabelHeading} from 'universal/components';
import DashFilterLabel from 'universal/components/DashFilterLabel/DashFilterLabel';
import DashFilterToggle from 'universal/components/DashFilterToggle/DashFilterToggle';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import LoadableTeamDashTeamMemberMenu from 'universal/components/LoadableTeamDashTeamMemberMenu';
import LoadableMenu from 'universal/components/LoadableMenu';
import styled, {css} from 'react-emotion';
import {PRO_LABEL} from 'universal/utils/constants';

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

const upgradeLinkStyles = css({
  color: ui.upgradeColor,
  cursor: 'pointer',
  marginLeft: '.75rem',
  ':hover, :focus': {
    color: ui.upgradeColor,
    textDecoration: 'underline'
  }
});

const TeamTasksHeader = (props) => {
  const {history, teamMemberFilterId, teamMemberFilterName, team} = props;
  const {teamId, teamName} = team;

  const goToArchive = () => history.push(`/team/${teamId}/archive`);

  // TODO: add conditional squeeze to the org for this team
  const orgId = 'HyF7ebanz';
  const orgName = 'Parabol, Inc.';
  const goToOrg = `/me/organizations/${orgId}`;
  const squeezeLabel = `Upgrade to ${PRO_LABEL}`;
  const isPersonal = true;
  // TODO: scope this to billing leader for now
  const isBillingLeader = true;

  return (
    <DashSectionHeader>
      <div>
        <LabelHeading>{'Team Dashboard'}</LabelHeading>
        <DashHeading>
          {`${teamName} Tasks`}
        </DashHeading>
        {isBillingLeader &&
          <OrgInfoBlock>
            <NavLink
              className={orgLinkStyles}
              title={orgName}
              to={goToOrg}
            >
              {orgName}
            </NavLink>
            {isPersonal &&
              <NavLink
                className={upgradeLinkStyles}
                title={squeezeLabel}
                to={goToOrg}
              >
                {'Upgrade to '}<b>{PRO_LABEL}</b>
              </NavLink>
            }
          </OrgInfoBlock>
        }
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
