import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {UserTasksHeader_viewer} from '~/__generated__/UserTasksHeader_viewer.graphql'
import DashSectionControls from '../../../../components/Dashboard/DashSectionControls'
import DashSectionHeader from '../../../../components/Dashboard/DashSectionHeader'
import DashFilterToggle from '../../../../components/DashFilterToggle/DashFilterToggle'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import lazyPreload from '../../../../utils/lazyPreload'
import styled from '@emotion/styled'
import LinkButton from '~/components/LinkButton'
import {PALETTE} from '~/styles/paletteV2'
import Checkbox from '~/components/Checkbox'
import {ICON_SIZE} from '~/styles/typographyV2'
import setArchivedTasksCheckbox from '~/utils/relay/setArchivedTasksCheckbox'
import useAtmosphere from '~/hooks/useAtmosphere'

const UserDashTeamMenu = lazyPreload(() =>
  import(
    /* webpackChunkName: 'UserDashTeamMenu' */
    '../../../../components/UserDashTeamMenu'
  )
)

const TeamDashTeamMemberMenu = lazyPreload(() =>
  import(
    /* webpackChunkName: 'TeamDashTeamMemberMenu' */
    '../../../../components/TeamDashTeamMemberMenu'
  )
)

const StyledLinkButton = styled(LinkButton)({
  marginLeft: 8,
  color: PALETTE.TEXT_GRAY,
  fontWeight: 600,
  ':hover, :focus, :active': {
    color: PALETTE.TEXT_MAIN
  }
})

const StyledCheckbox = styled(Checkbox)({
  fontSize: ICON_SIZE.MD24,
  marginRight: 8,
  textAlign: 'center',
  userSelect: 'none',
  width: ICON_SIZE.MD24
})

const UserTasksHeaderDashSectionControls = styled(DashSectionControls)({
  width: '40%'
})

interface Props {
  viewer: UserTasksHeader_viewer
}

const UserTasksHeader = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {viewer} = props
  const {
    menuPortal: teamFilterMenuPortal,
    togglePortal: teamFilterTogglePortal,
    originRef: teamFilterOriginRef,
    menuProps: teamFilterMenuProps
  } = useMenu(MenuPosition.UPPER_RIGHT, {
    isDropdown: true
  })
  const {
    menuPortal: teamMemberFilterMenuPortal,
    togglePortal: teamMemberFilterTogglePortal,
    originRef: teamMemberFilterOriginRef,
    menuProps: teamMemberFilterMenuProps
  } = useMenu(MenuPosition.UPPER_RIGHT, {
    isDropdown: true
  })
  const {teamFilter, teamMemberFilter, showArchivedTasksCheckbox} = viewer
  const teamFilterName = (teamFilter && teamFilter.name) || 'My teams'
  const teamMemberFilterName =
    teamFilter && teamMemberFilter ?
      (teamMemberFilter.tms.includes(teamFilter.id) ?
        teamMemberFilter.preferredName :
        'My team members')
      :
      (teamMemberFilter && teamMemberFilter.preferredName) || 'My team members'
  return (
    <DashSectionHeader>
      <UserTasksHeaderDashSectionControls>
        <DashFilterToggle
          label='Team'
          onClick={teamFilterTogglePortal}
          onMouseEnter={UserDashTeamMenu.preload}
          ref={teamFilterOriginRef}
          value={teamFilterName}
          iconText='group'
        />
        {teamFilterMenuPortal(<UserDashTeamMenu menuProps={teamFilterMenuProps} viewer={viewer} />)}

        {/* Filter by Owner */}
        <DashFilterToggle
          label='Team Member'
          onClick={teamMemberFilterTogglePortal}
          onMouseEnter={TeamDashTeamMemberMenu.preload}
          ref={teamMemberFilterOriginRef}
          value={teamMemberFilterName}
          iconText='person'
        />
        {teamMemberFilterMenuPortal(<TeamDashTeamMemberMenu menuProps={teamMemberFilterMenuProps} viewer={viewer} />)}

        <StyledLinkButton
          onClick={() => setArchivedTasksCheckbox(atmosphere, !showArchivedTasksCheckbox)}
        >
          <StyledCheckbox active={showArchivedTasksCheckbox} />
          {'Archived'}
        </StyledLinkButton>
      </UserTasksHeaderDashSectionControls>
    </DashSectionHeader>
  )
}

export default createFragmentContainer(UserTasksHeader, {
  viewer: graphql`
    fragment UserTasksHeader_viewer on User {
      id
      ...UserDashTeamMenu_viewer
      ...TeamDashTeamMemberMenu_viewer
      teamFilter {
        id
        name
      }
      teamMemberFilter {
        id
        preferredName
        tms
      }
      showArchivedTasksCheckbox
    }
  `
})
