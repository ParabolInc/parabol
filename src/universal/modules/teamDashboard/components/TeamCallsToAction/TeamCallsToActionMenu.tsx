import React from 'react'
import styled from '@emotion/styled'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import Menu from 'universal/components/Menu'
import MenuItem from 'universal/components/MenuItem'
import MenuItemIcon from 'universal/components/MenuItemIcon'
import MenuItemLabel from 'universal/components/MenuItemLabel'
import {MenuProps} from 'universal/hooks/useMenu'
import {ACTION, RETROSPECTIVE} from 'universal/utils/constants'
import {meetingTypeToSlug} from 'universal/utils/meetings/lookups'

interface Props extends RouteComponentProps<{}> {
  menuProps: MenuProps
  minWidth: number
  teamId: string
}

const WideMenu = styled(Menu)<{minWidth: number}>(({minWidth}) => ({
  minWidth
}))

const TeamCallsToActionMenu = (props: Props) => {
  const {menuProps, history, minWidth, teamId} = props

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
      {...menuProps}
      minWidth={minWidth}
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
