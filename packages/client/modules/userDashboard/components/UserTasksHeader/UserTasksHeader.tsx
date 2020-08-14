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
  justifyContent: 'flex-start',
})

interface Props {
  viewer: UserTasksHeader_viewer
}

const UserTasksHeader = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {viewer} = props
  const {menuPortal, togglePortal, originRef, menuProps} = useMenu(MenuPosition.UPPER_RIGHT, {
    isDropdown: true
  })
  const {teamFilter, showArchivedTasksCheckbox} = viewer
  const teamFilterName = (teamFilter && teamFilter.name) || 'All teams'
  return (
    <DashSectionHeader>
      <UserTasksHeaderDashSectionControls>
        <DashFilterToggle
          label='Team'
          onClick={togglePortal}
          onMouseEnter={UserDashTeamMenu.preload}
          ref={originRef}
          value={teamFilterName}
          iconText='group'
        />
        {menuPortal(<UserDashTeamMenu menuProps={menuProps} viewer={viewer} />)}

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
      teamFilter {
        id
        name
      }
      showArchivedTasksCheckbox
    }
  `
})
