import {TeamTasksHeader_team} from '../../../../__generated__/TeamTasksHeader_team.graphql'
import React from 'react'
import styled from '@emotion/styled';
import {createFragmentContainer} from 'react-relay'
import {NavLink, RouteComponentProps, withRouter} from 'react-router-dom'
import DashHeading from '../../../../components/Dashboard/DashHeading'
import DashSectionControl from '../../../../components/Dashboard/DashSectionControl'
import DashSectionControls from '../../../../components/Dashboard/DashSectionControls'
import DashSectionHeader from '../../../../components/Dashboard/DashSectionHeader'
import DashFilterLabel from '../../../../components/DashFilterLabel/DashFilterLabel'
import DashFilterToggle from '../../../../components/DashFilterToggle/DashFilterToggle'
import DashNavControl from '../../../../components/DashNavControl/DashNavControl'
import LabelHeading from '../../../../components/LabelHeading/LabelHeading'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import appTheme from '../../../../styles/theme/appTheme'
import ui from '../../../../styles/ui'
import lazyPreload from '../../../../utils/lazyPreload'
import graphql from 'babel-plugin-relay/macro'
import {ClassNames} from '@emotion/core'

const OrgInfoBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  fontSize: appTheme.typography.s2,
  lineHeight: appTheme.typography.s5,
  marginTop: '.125rem'
})

const orgLinkStyles = {
  color: ui.linkColor,
  cursor: 'pointer',
  ':hover, :focus': {
    color: ui.linkColorHover
  }
}

const TeamDashTeamMemberMenu = lazyPreload(() =>
  import(/* webpackChunkName: 'TeamDashTeamMemberMenu' */
  '../../../../components/TeamDashTeamMemberMenu')
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
  const {togglePortal, menuProps, originRef, menuPortal} = useMenu(MenuPosition.UPPER_RIGHT, {
    isDropdown: true
  })
  return (
    <DashSectionHeader>
      <div>
        <LabelHeading>{'Team Dashboard'}</LabelHeading>
        <DashHeading>{`${teamName} Tasks`}</DashHeading>
        <OrgInfoBlock>
          <ClassNames>
            {({css}) => {
              return (
                <NavLink className={css(orgLinkStyles)} title={orgName} to={`/me/organizations/${orgId}`}>
                  {orgName}
                </NavLink>
              )
            }}
          </ClassNames>
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
              menuProps={menuProps}
              team={team}
              teamMemberFilterId={teamMemberFilterId}
            />
          )}
        </DashSectionControl>
      </DashSectionControls>
    </DashSectionHeader>
  )
}

export default createFragmentContainer(withRouter(TeamTasksHeader), {
  team: graphql`
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
})
