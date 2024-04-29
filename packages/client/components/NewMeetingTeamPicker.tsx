import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {ExpandMore} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {NewMeetingTeamPicker_selectedTeam$key} from '~/__generated__/NewMeetingTeamPicker_selectedTeam.graphql'
import {NewMeetingTeamPicker_teams$key} from '~/__generated__/NewMeetingTeamPicker_teams.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {Menu} from '../ui/Menu/Menu'
import setPreferredTeamId from '../utils/relay/setPreferredTeamId'
import NewMeetingTeamPickerAvatars from './NewMeetingTeamPickerAvatars'

interface Props {
  selectedTeamRef: NewMeetingTeamPicker_selectedTeam$key
  teamsRef: NewMeetingTeamPicker_teams$key
  onSelectTeam: (teamId: string) => void
}

const NewMeetingTeamPicker = (props: Props) => {
  const {selectedTeamRef, teamsRef, onSelectTeam} = props

  const atmosphere = useAtmosphere()

  const handleSelectTeam = (teamId: string) => {
    setPreferredTeamId(atmosphere, teamId)
    onSelectTeam(teamId)
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
      <Menu
        className='data-[side=top]:animate-slideUp data-[side=bottom]:animate-slideDown'
        trigger={
          <div className='group flex cursor-pointer items-center rounded-md bg-slate-200 p-2 hover:bg-slate-300'>
            <div className='p-2'>
              <NewMeetingTeamPickerAvatars teamRef={selectedTeam} />
            </div>
            <div className='grow pl-2'>
              <div className='text-sm leading-4'>Team</div>
              <div className='text-xl font-semibold leading-5'>{name}</div>
            </div>
            <div className='s-6 p-2 pl-0'>
              <ExpandMore className='text-4xl text-slate-600 transition-transform group-data-[state=open]:rotate-180' />
            </div>
          </div>
        }
      >
        <div
          className='w-[var(--radix-dropdown-menu-trigger-width)]'
        >
          <DropdownMenu.Label className='text-base px-3 py-2 font-semibold'>Select Team:</DropdownMenu.Label>
          <DropdownMenu.Separator className='border-b border-slate-300' />
          <div className='py-2'>
            {teams.map((team) => {
              return (
                <DropdownMenu.Item
                  key={team.id}
                  className='text-base px-3 py-1 hover:bg-slate-200 outline-none'
                  onClick={() => {
                    handleSelectTeam(team.id)
                  }}
                >
                  {team.name}
                </DropdownMenu.Item>
              )
            })}
          </div>
        </div>
      </Menu>
    </>
  )
}

export default NewMeetingTeamPicker
