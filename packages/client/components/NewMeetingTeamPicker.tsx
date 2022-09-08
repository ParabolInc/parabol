import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {useFragment} from 'react-relay'
import {NewMeetingTeamPicker_selectedTeam$key} from '~/__generated__/NewMeetingTeamPicker_selectedTeam.graphql'
import {NewMeetingTeamPicker_teams$key} from '~/__generated__/NewMeetingTeamPicker_teams.graphql'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {PortalStatus} from '../hooks/usePortal'
import useRouter from '../hooks/useRouter'
import lazyPreload from '../utils/lazyPreload'
import NewMeetingDropdown from './NewMeetingDropdown'
import NewMeetingTeamPickerAvatars from './NewMeetingTeamPickerAvatars'

const SelectTeamDropdown = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'SelectTeamDropdown' */
      './SelectTeamDropdown'
    )
)

interface Props {
  selectedTeamRef: NewMeetingTeamPicker_selectedTeam$key
  teamsRef: NewMeetingTeamPicker_teams$key
}

const NewMeetingTeamPicker = (props: Props) => {
  const {selectedTeamRef, teamsRef} = props

  const {t} = useTranslation()

  const {history} = useRouter()
  const {togglePortal, menuPortal, originRef, menuProps, portalStatus} = useMenu<HTMLDivElement>(
    MenuPosition.LOWER_RIGHT,
    {
      parentId: 'newMeetingRoot',
      isDropdown: true
    }
  )

  const selectedTeam = useFragment(
    graphql`
      fragment NewMeetingTeamPicker_selectedTeam on Team {
        ...NewMeetingTeamPickerAvatars_team
        name
      }
    `,
    selectedTeamRef
  )

  const teams = useFragment(
    graphql`
      fragment NewMeetingTeamPicker_teams on Team @relay(plural: true) {
        ...SelectTeamDropdown_teams
        id
        name
      }
    `,
    teamsRef
  )

  const {name} = selectedTeam
  const handleSelect = (teamId: string) => {
    history.replace(
      t('NewMeetingTeamPicker.NewMeetingTeamId', {
        teamId
      })
    )
  }
  return (
    <>
      <NewMeetingDropdown
        icon={<NewMeetingTeamPickerAvatars teamRef={selectedTeam} />}
        label={name}
        onClick={togglePortal}
        onMouseEnter={SelectTeamDropdown.preload}
        disabled={teams.length === 0}
        ref={originRef}
        title={t('NewMeetingTeamPicker.Team')}
        opened={[PortalStatus.Entering, PortalStatus.Entered].includes(portalStatus)}
      />
      {menuPortal(
        <SelectTeamDropdown menuProps={menuProps} teams={teams} teamHandleClick={handleSelect} />
      )}
    </>
  )
}

export default NewMeetingTeamPicker
