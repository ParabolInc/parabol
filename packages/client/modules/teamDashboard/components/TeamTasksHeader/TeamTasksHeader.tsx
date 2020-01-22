import {TeamTasksHeader_team} from '../../../../__generated__/TeamTasksHeader_team.graphql'
import {TeamTasksHeader_viewer} from '../../../../__generated__/TeamTasksHeader_viewer.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import {NavLink} from 'react-router-dom'
import DashSectionControls from '../../../../components/Dashboard/DashSectionControls'
import DashSectionHeader from '../../../../components/Dashboard/DashSectionHeader'
import DashFilterToggle from '../../../../components/DashFilterToggle/DashFilterToggle'
import DashNavControl from '../../../../components/DashNavControl/DashNavControl'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import {PALETTE} from '../../../../styles/paletteV2'
import {Breakpoint} from '../../../../types/constEnums'
import lazyPreload from '../../../../utils/lazyPreload'
import graphql from 'babel-plugin-relay/macro'
import {ClassNames} from '@emotion/core'
import useRouter from '../../../../hooks/useRouter'
import FlatButton from 'components/FlatButton'
import Icon from 'components/Icon'
import useTooltip from '../../../../hooks/useTooltip'
import DashboardAvatars from 'components/DashboardAvatars/DashboardAvatars'
import AgendaToggle from 'modules/teamDashboard/components/AgendaToggle/AgendaToggle'
import makeMinWidthMediaQuery from 'utils/makeMinWidthMediaQuery'

const desktopBreakpoint = makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)

const TeamMeta = styled('div')({
  // define
})

const TeamLinks = styled('div')({
  alignItems: 'center',
  display: 'flex',
  fontSize: 14,
  justifyContent: 'space-between',
  lineHeight: '20px',
  margin: '0 0 16px',
  maxWidth: '100%',
  overflow: 'auto',
  width: '100%',
  [desktopBreakpoint]: {
    justifyContent: 'flex-start',
    margin: 0,
    width: 'auto'
  }
})

const DashHeading = styled('div')({
  alignItems: 'center',
  color: PALETTE.TEXT_MAIN,
  display: 'flex',
  fontSize: 24,
  lineHeight: '32px',
  [desktopBreakpoint]: {
    marginBottom: 8
  }
})

const orgLinkStyles = {
  color: PALETTE.TEXT_GRAY,
  cursor: 'pointer',
  height: 24,
  lineHeight: '24px',
  marginRight: 16,
  ':hover, :focus': {
    color: PALETTE.LINK_BLUE
  }
}

const TeamDashTeamMemberMenu = lazyPreload(() =>
  import(
    /* webpackChunkName: 'TeamDashTeamMemberMenu' */
    '../../../../components/TeamDashTeamMemberMenu'
  )
)

const StyledFlatButton = styled(FlatButton)({
  border: 0,
  padding: 0,
  height: 24,
  marginLeft: 8,
  width: 24,
  '&:hover, &:focus, &:active': {
    color: PALETTE.LINK_BLUE
  }
})

const TeamHeaderAndAvatars = styled('div')({
  borderBottom: `1px solid ${PALETTE.BORDER_DASH_LIGHT}`,
  flexShrink: 0,
  margin: '0 0 16px',
  padding: '0 0 16px',
  width: '100%',
  [desktopBreakpoint]: {
    display: 'flex',
    justifyContent: 'space-between'
  }
})

const AvatarsAndAgendaToggle = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  width: '100%',
  [desktopBreakpoint]: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    width: 'auto'
  }
})

const StyledIcon = styled(Icon)({
  color: PALETTE.TEXT_GRAY,
  fontSize: 18
})

interface Props {
  team: TeamTasksHeader_team
  viewer: TeamTasksHeader_viewer
}

const TeamTasksHeader = (props: Props) => {
  const {team, viewer} = props
  const teamMember = viewer.teamMember!
  const {hideAgenda} = teamMember
  const {history} = useRouter()
  const {organization, id: teamId, name: teamName, teamMemberFilter} = team
  const teamMemberFilterName =
    (teamMemberFilter && teamMemberFilter.preferredName) || 'All team members'
  const {name: orgName, id: orgId} = organization
  const {togglePortal, menuProps, originRef, menuPortal} = useMenu(MenuPosition.UPPER_RIGHT, {
    isDropdown: true
  })
  const goToTeamSettings = () => {
    history.push(`/team/${teamId}/settings/`)
  }
  const {tooltipPortal, openTooltip, closeTooltip, originRef: tooltipOriginRef} = useTooltip<
    HTMLButtonElement
  >(MenuPosition.UPPER_CENTER)
  return (
    <DashSectionHeader>
      <TeamHeaderAndAvatars>
        <TeamMeta>
          <DashHeading>
            {teamName}
            <StyledFlatButton
              aria-label='Team Settings'
              onMouseEnter={openTooltip}
              onMouseLeave={closeTooltip}
              onClick={goToTeamSettings}
              ref={tooltipOriginRef}
            >
              <StyledIcon>settings</StyledIcon>
            </StyledFlatButton>
            {tooltipPortal('Team Settings')}
          </DashHeading>
          <TeamLinks>
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
          </TeamLinks>
        </TeamMeta>
        <AvatarsAndAgendaToggle>
          <DashboardAvatars team={team} />
          <AgendaToggle hideAgenda={hideAgenda} teamId={teamId} />
        </AvatarsAndAgendaToggle>
      </TeamHeaderAndAvatars>
      <DashSectionControls>
        {/* Filter by Owner */}
        <DashFilterToggle
          label='Team Member'
          onClick={togglePortal}
          onMouseEnter={TeamDashTeamMemberMenu.preload}
          ref={originRef}
          value={teamMemberFilterName}
        />
        {menuPortal(<TeamDashTeamMemberMenu menuProps={menuProps} team={team} />)}
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
      ...TeamDashTeamMemberMenu_team
    }
  `,
  viewer: graphql`
    fragment TeamTasksHeader_viewer on User {
      teamMember(teamId: $teamId) {
        hideAgenda
      }
    }
  `
})
