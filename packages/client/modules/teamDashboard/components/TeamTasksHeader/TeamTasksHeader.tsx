import {TeamTasksHeader_team} from '../../../../__generated__/TeamTasksHeader_team.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import {NavLink} from 'react-router-dom'
import DashSectionControl from '../../../../components/Dashboard/DashSectionControl'
import DashSectionControls from '../../../../components/Dashboard/DashSectionControls'
import DashSectionHeader from '../../../../components/Dashboard/DashSectionHeader'
import DashFilterLabel from '../../../../components/DashFilterLabel/DashFilterLabel'
import DashFilterToggle from '../../../../components/DashFilterToggle/DashFilterToggle'
import DashNavControl from '../../../../components/DashNavControl/DashNavControl'
import LabelHeading from '../../../../components/LabelHeading/LabelHeading'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import {PALETTE} from '../../../../styles/paletteV2'
import {Breakpoint} from '../../../../types/constEnums'
import lazyPreload from '../../../../utils/lazyPreload'
import graphql from 'babel-plugin-relay/macro'
import {ClassNames} from '@emotion/core'
import useRouter from '../../../../hooks/useRouter'

const OrgInfoBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  fontSize: 13,
  lineHeight: '20px',
  marginTop: '.125rem'
})

const DashHeading = styled('div')({
  color: PALETTE.TEXT_MAIN,
  fontSize: 24,
  fontWeight: 600,
  lineHeight: '1.25',
  [`@media (min-width: ${Breakpoint.DASHBOARD_WIDE})`]: {
    fontSize: 34
  }
})

const orgLinkStyles = {
  color: PALETTE.TEXT_GRAY,
  cursor: 'pointer',
  ':hover, :focus': {
    color: PALETTE.TEXT_BLUE
  }
}

const TeamDashTeamMemberMenu = lazyPreload(() =>
  import(
    /* webpackChunkName: 'TeamDashTeamMemberMenu' */
    '../../../../components/TeamDashTeamMemberMenu'
  )
)

interface Props {
  team: TeamTasksHeader_team
}

const TeamTasksHeader = (props: Props) => {
  const {team} = props
  const {history} = useRouter()
  const {organization, teamId, teamName, teamMemberFilter} = team
  const teamMemberFilterName = (teamMemberFilter && teamMemberFilter.preferredName) || 'All members'
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
                <NavLink
                  className={css(orgLinkStyles)}
                  title={orgName}
                  to={`/me/organizations/${orgId}`}
                >
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
          {menuPortal(<TeamDashTeamMemberMenu menuProps={menuProps} team={team} />)}
        </DashSectionControl>
      </DashSectionControls>
    </DashSectionHeader>
  )
}

export default createFragmentContainer(TeamTasksHeader, {
  team: graphql`
    fragment TeamTasksHeader_team on Team {
      teamId: id
      teamName: name
      organization {
        orgId: id
        orgName: name
      }
      teamMemberFilter {
        preferredName
      }
      ...TeamDashTeamMemberMenu_team
    }
  `
})
