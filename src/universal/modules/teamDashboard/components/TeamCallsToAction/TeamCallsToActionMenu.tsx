import React from 'react'
import styled from 'react-emotion'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import Menu from 'universal/components/Menu'
import MenuItem from 'universal/components/MenuItem'
import MenuItemIcon from 'universal/components/MenuItemIcon'
import MenuItemLabel from 'universal/components/MenuItemLabel'
import {PortalState} from 'universal/hooks/usePortal'
import {ACTION, RETROSPECTIVE} from 'universal/utils/constants'
import {meetingTypeToSlug} from 'universal/utils/meetings/lookups'

interface Props extends RouteComponentProps<{}> {
  closePortal: () => void
  minWidth: number
  portalState: PortalState
  teamId: string
}

const WideMenu = styled(Menu)(({minWidth}: {minWidth: number}) => ({
  minWidth
}))

const TeamCallsToActionMenu = (props: Props) => {
  const {closePortal, history, minWidth, portalState, teamId} = props

  const goToMeetingLobby = () => {
    const slug = meetingTypeToSlug[ACTION]
    history.push(`/${slug}/${teamId}/`)
  }

  const goToRetroLobby = () => {
    const slug = meetingTypeToSlug[RETROSPECTIVE]
    history.push(`/${slug}/${teamId}/`)
  }

  return (
    <WideMenu
      ariaLabel={'Select the meeting you would like start'}
      closePortal={closePortal}
      minWidth={minWidth}
      portalState={portalState}
      isDropdown
    >
      <MenuItem
        label={
          <MenuItemLabel>
            <MenuItemIcon icon={'change_history'} />
            {'Start Action Meeting'}
          </MenuItemLabel>
        }
        onClick={goToMeetingLobby}
      />
      <MenuItem
        label={
          <MenuItemLabel>
            <MenuItemIcon icon={'history'} />
            {'Start Retro Meeting'}
          </MenuItemLabel>
        }
        onClick={goToRetroLobby}
      />
    </WideMenu>
  )
}

export default withRouter(TeamCallsToActionMenu)
