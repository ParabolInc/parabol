import {TeamTasksHeader_team} from '__generated__/TeamTasksHeader_team.graphql'
import React from 'react'
import styled, {css} from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import {NavLink, RouteComponentProps, withRouter} from 'react-router-dom'
import DashHeading from 'universal/components/Dashboard/DashHeading'
import DashSectionControl from 'universal/components/Dashboard/DashSectionControl'
import DashSectionControls from 'universal/components/Dashboard/DashSectionControls'
import DashSectionHeader from 'universal/components/Dashboard/DashSectionHeader'
import DashFilterLabel from 'universal/components/DashFilterLabel/DashFilterLabel'
import DashFilterToggle from 'universal/components/DashFilterToggle/DashFilterToggle'
import DashNavControl from 'universal/components/DashNavControl/DashNavControl'
import LabelHeading from 'universal/components/LabelHeading/LabelHeading'
import {MenuPosition} from 'universal/hooks/useCoords'
import useMenu from 'universal/hooks/useMenu'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import lazyPreload from 'universal/utils/lazyPreload'

const OrgInfoBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  fontSize: appTheme.typography.s2,
  lineHeight: appTheme.typography.s5,
  marginTop: '.125rem'
})

const orgLinkStyles = css({
  color: ui.linkColor,
  cursor: 'pointer',
  ':hover, :focus': {
    color: ui.linkColorHover
  }
})

const TeamDashTeamMemberMenu = lazyPreload(() =>
  import(/* webpackChunkName: 'TeamDashTeamMemberMenu' */
  'universal/components/TeamDashTeamMemberMenu')
)

interface Props extends RouteComponentProps<{}> {
  team: TeamTasksHeader_team
  teamMemberFilterId: string
  teamMemberFilterName: string
}

const TeamTasksHeader = (props: Props) => {
  const {history, teamMemberFilterId, teamMemberFilterName, team} = props
  const {organization, teamId, teamName} = team
  const {orgName, orgId} = organization
  const {togglePortal, closePortal, originRef, menuPortal} = useMenu(MenuPosition.UPPER_RIGHT)
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
          icon='archive'
          label='See Archived Tasks'
          onClick={() => history.push(`/team/${teamId}/archive`)}
        />

        {/* Filter by Owner */}
        <DashSectionControl>
          <DashFilterLabel>
            <b>{'Show Tasks for'}</b>
            {': '}
          </DashFilterLabel>
          <DashFilterToggle
            ref={originRef}
            onClick={togglePortal}
            onMouseEnter={TeamDashTeamMemberMenu.preload}
            label={teamMemberFilterName}
          />
          {menuPortal(
            <TeamDashTeamMemberMenu
              closePortal={closePortal}
              team={team}
              teamMemberFilterId={teamMemberFilterId}
            />
          )}
        </DashSectionControl>
      </DashSectionControls>
    </DashSectionHeader>
  )
}

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
)
