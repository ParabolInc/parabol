import {ClassNames} from '@emotion/core'
import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {NavLink} from 'react-router-dom'
import DashboardAvatars from '~/components/DashboardAvatars/DashboardAvatars'
import DashFilterToggle from '~/components/DashFilterToggle/DashFilterToggle'
import AgendaToggle from '~/modules/teamDashboard/components/AgendaToggle/AgendaToggle'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import DashSectionControls from '../../../../components/Dashboard/DashSectionControls'
import DashSectionHeader from '../../../../components/Dashboard/DashSectionHeader'
import DashNavControl from '../../../../components/DashNavControl/DashNavControl'
import InviteTeamMemberAvatar from '../../../../components/InviteTeamMemberAvatar'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useRouter from '../../../../hooks/useRouter'
import {PALETTE} from '../../../../styles/paletteV3'
import {Breakpoint} from '../../../../types/constEnums'
import lazyPreload from '../../../../utils/lazyPreload'
import {TeamTasksHeader_team} from '../../../../__generated__/TeamTasksHeader_team.graphql'

const desktopBreakpoint = makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)

const TeamMeta = styled('div')({
  // define
})

const TeamLinks = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  fontSize: 12,
  justifyContent: 'flex-start',
  lineHeight: '16px',
  maxWidth: '100%',
  width: '100%',
  [desktopBreakpoint]: {
    justifyContent: 'flex-start',
    width: 'auto'
  }
})

const DashHeading = styled('div')({
  alignItems: 'center',
  color: PALETTE.SLATE_700,
  display: 'flex',
  fontSize: 20,
  fontWeight: 600,
  lineHeight: '24px',
  height: 28
})

const linkStyles = {
  color: PALETTE.SKY_500,
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 12,
  lineHeight: '12px',
  marginRight: 8,
  outline: 0,
  ':hover, :focus, :active': {
    color: PALETTE.SKY_600
  }
}

const secondLink = {
  ...linkStyles,
  marginRight: 0,
  marginLeft: 8
}

const TeamDashTeamMemberMenu = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'TeamDashTeamMemberMenu' */
      '../../../../components/TeamDashTeamMemberMenu'
    )
)

const TeamHeaderAndAvatars = styled('div')({
  borderBottom: `1px solid ${PALETTE.SLATE_300}`,
  flexShrink: 0,
  margin: '0 0 16px',
  padding: '0 0 16px',
  width: '100%',
  [desktopBreakpoint]: {
    display: 'flex',
    justifyContent: 'space-between'
  }
})

const Avatars = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  paddingTop: 12,
  [desktopBreakpoint]: {
    paddingTop: 0
  }
})

interface Props {
  team: TeamTasksHeader_team
}

const TeamTasksHeader = (props: Props) => {
  const {team} = props
  const {history} = useRouter()
  const {organization, id: teamId, name: teamName, teamMemberFilter, teamMembers} = team
  const teamMemberFilterName =
    (teamMemberFilter && teamMemberFilter.preferredName) || 'All team members'
  const {name: orgName, id: orgId} = organization
  const {togglePortal, menuProps, originRef, menuPortal} = useMenu(MenuPosition.UPPER_RIGHT, {
    isDropdown: true
  })
  return (
    <DashSectionHeader>
      <TeamHeaderAndAvatars>
        <TeamMeta>
          <DashHeading>{teamName}</DashHeading>
          <TeamLinks>
            <ClassNames>
              {({css}) => {
                return (
                  <NavLink
                    className={css(linkStyles)}
                    title={orgName}
                    to={`/me/organizations/${orgId}/billing`}
                  >
                    {orgName}
                  </NavLink>
                )
              }}
            </ClassNames>
            {'•'}
            <ClassNames>
              {({css}) => {
                return (
                  <NavLink
                    className={css(secondLink)}
                    title={'Settings & Integrations'}
                    to={`/team/${teamId}/settings/`}
                  >
                    {'Settings & Integrations'}
                  </NavLink>
                )
              }}
            </ClassNames>
          </TeamLinks>
        </TeamMeta>
        <Avatars>
          <DashboardAvatars team={team} />
          <InviteTeamMemberAvatar teamId={teamId} teamMembers={teamMembers} />
          <AgendaToggle teamId={teamId} />
        </Avatars>
      </TeamHeaderAndAvatars>
      <DashSectionControls>
        {/* Filter by Owner */}
        <TeamMeta>
          {teamMembers.length > 1 && (
            <DashFilterToggle
              label='Team Member'
              onClick={togglePortal}
              onMouseEnter={TeamDashTeamMemberMenu.preload}
              ref={originRef}
              value={teamMemberFilterName}
            />
          )}
          {menuPortal(<TeamDashTeamMemberMenu menuProps={menuProps} team={team} />)}
        </TeamMeta>
        {/* Archive Link */}
        <DashNavControl
          icon='archive'
          label='Archived Tasks'
          onClick={() => history.push(`/team/${teamId}/archive`)}
        />
      </DashSectionControls>
    </DashSectionHeader>
  )
}

export default createFragmentContainer(TeamTasksHeader, {
  team: graphql`
    fragment TeamTasksHeader_team on Team {
      ...DashboardAvatars_team
      id
      name
      organization {
        id
        name
      }
      teamMemberFilter {
        preferredName
      }
      teamMembers(sortBy: "preferredName") {
        ...InviteTeamMemberAvatar_teamMembers
        ...DashboardAvatar_teamMember
        id
      }
      ...TeamDashTeamMemberMenu_team
    }
  `
})
