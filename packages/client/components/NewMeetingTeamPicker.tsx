import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import lazyPreload from '../utils/lazyPreload'
import {TierEnum} from '../types/graphql'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import DropdownMenuToggle from './DropdownMenuToggle'
import TierTag from './Tag/TierTag'
import useRouter from '../hooks/useRouter'

const MenuToggleInner = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  minWidth: 0
})

const MenuToggleLabel = styled('div')({
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
})

interface Props {
  selectedTeam: NewMeetingTeamPicker_selectedTeam
  teams: NewMeetingTeamPicker_teams
}

const SelectTeamDropdown = lazyPreload(() =>
  import(
    /* webpackChunkName: 'SelectTeamDropdown' */
    './SelectTeamDropdown'
  )
)

const NewMeetingTeamPicker = (props: Props) => {
  const {selectedTeam, teams} = props
  const {history} = useRouter()
  const {togglePortal, menuPortal, originRef, menuProps} = useMenu<HTMLDivElement>(
    MenuPosition.UPPER_RIGHT,
    {
      isDropdown: true
    }
  )
  const {name, tier} = selectedTeam
  const handleSelect = (teamId: string) => {
    history.replace(`/new-meeting/${teamId}`)
  }
  return (
    <>
      <DropdownMenuToggle
        onMouseEnter={SelectTeamDropdown.preload}
        onClick={togglePortal}
        ref={originRef}
        disabled={teams.length === 0}
        defaultText={
          <MenuToggleInner>
            <MenuToggleLabel>{name}</MenuToggleLabel>
            {tier !== TierEnum.personal && <TierTag tier={tier as TierEnum} />}
          </MenuToggleInner>
        }
      />
      {menuPortal(
        <SelectTeamDropdown menuProps={menuProps} teams={teams} teamHandleClick={handleSelect} />
      )}
    </>
  )
}

export default createFragmentContainer(NewMeetingTeamPicker, {
  selectedTeam: graphql`
    fragment NewMeetingTeamPicker_selectedTeam on Team {
      name
      tier
    }
  `,
  teams: graphql`
    fragment NewMeetingTeamPicker_teams on Team @relay(plural: true) {
      id
      name
      tier
    }
  `
})
