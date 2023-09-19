import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {NewMeetingTeamPicker_selectedTeam$key} from '~/__generated__/NewMeetingTeamPicker_selectedTeam.graphql'
import {NewMeetingTeamPicker_teams$key} from '~/__generated__/NewMeetingTeamPicker_teams.graphql'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {PortalStatus} from '../hooks/usePortal'
import lazyPreload from '../utils/lazyPreload'
import NewMeetingDropdown from './NewMeetingDropdown'
import NewMeetingTeamPickerAvatars from './NewMeetingTeamPickerAvatars'
import useAtmosphere from '../hooks/useAtmosphere'
import setPreferredTeamId from '../utils/relay/setPreferredTeamId'
// import {useDialogState} from "~/ui/Dialog/useDialogState";
import AddTeamDialogRoot from '~/components/AddTeamDialogRoot'

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
  onSelectTeam: (teamId: string) => void
  positionOverride?: MenuPosition
  customPortal?: React.ReactNode
  allowAddTeam?: boolean
}

const NewMeetingTeamPicker = (props: Props) => {
  const {selectedTeamRef, teamsRef, onSelectTeam, positionOverride, customPortal, allowAddTeam} =
    props
  const {togglePortal, menuPortal, originRef, menuProps, portalStatus} = useMenu<HTMLDivElement>(
    positionOverride ?? MenuPosition.LOWER_RIGHT,
    {
      isDropdown: true
    }
  )

  const [addTeamDialogOpen, setAddTeamDialogOpen] = React.useState(false)

  const atmosphere = useAtmosphere()

  const handleSelectTeam = (teamId: string) => {
    setPreferredTeamId(atmosphere, teamId)
    onSelectTeam(teamId)
  }

  const handleAddTeamClick = () => {
    setAddTeamDialogOpen(true)
  }

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
  return (
    <>
      <NewMeetingDropdown
        icon={<NewMeetingTeamPickerAvatars teamRef={selectedTeam} />}
        label={name}
        onClick={togglePortal}
        onMouseEnter={SelectTeamDropdown.preload}
        disabled={teams.length === 0}
        ref={originRef}
        title={'Team'}
        opened={[PortalStatus.Entering, PortalStatus.Entered].includes(portalStatus)}
      />
      {menuPortal(
        customPortal ? (
          customPortal
        ) : (
          <SelectTeamDropdown
            menuProps={menuProps}
            teams={teams}
            teamHandleClick={handleSelectTeam}
            onAddTeamClick={allowAddTeam ? handleAddTeamClick : undefined}
          />
        )
      )}
      {addTeamDialogOpen && (
        <AddTeamDialogRoot
          onClose={() => {
            setAddTeamDialogOpen(false)
          }}
        />
      )}
    </>
  )
}

export default NewMeetingTeamPicker
