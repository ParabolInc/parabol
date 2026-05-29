import {LockOpen} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {NewMeetingTeamPicker_selectedTeam$key} from '~/__generated__/NewMeetingTeamPicker_selectedTeam.graphql'
import type {NewMeetingTeamPicker_teams$key} from '~/__generated__/NewMeetingTeamPicker_teams.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {PALETTE} from '../styles/paletteV3'
import {Select} from '../ui/Select/Select'
import {SelectContent} from '../ui/Select/SelectContent'
import {SelectGroup} from '../ui/Select/SelectGroup'
import {SelectItem} from '../ui/Select/SelectItem'
import {SelectTrigger} from '../ui/Select/SelectTrigger'
import setPreferredTeamId from '../utils/relay/setPreferredTeamId'
import NewMeetingTeamPickerAvatars from './NewMeetingTeamPickerAvatars'

interface Props {
  selectedTeamRef: NewMeetingTeamPicker_selectedTeam$key
  teamsRef: NewMeetingTeamPicker_teams$key
  onSelectTeam: (teamId: string) => void
  onShareToOrg?: () => void
}

const NewMeetingTeamPicker = (props: Props) => {
  const {selectedTeamRef, teamsRef, onSelectTeam, onShareToOrg} = props

  const atmosphere = useAtmosphere()

  const handleSelectTeam = (teamId: string) => {
    setPreferredTeamId(atmosphere, teamId)
    onSelectTeam(teamId)
  }

  const selectedTeam = useFragment(
    graphql`
      fragment NewMeetingTeamPicker_selectedTeam on Team {
        ...NewMeetingTeamPickerAvatars_team
        id
        name
        organization {
          name
        }
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

  const {id: selectedTeamId, name} = selectedTeam

  return (
    <Select value={selectedTeamId} onValueChange={handleSelectTeam}>
      <SelectTrigger
        className='h-auto border-0 bg-slate-200 p-2 hover:bg-slate-300 data-[state=open]:border-0'
        iconClassName='mr-2'
      >
        <div className='p-2'>
          <NewMeetingTeamPickerAvatars teamRef={selectedTeam} />
        </div>
        <div className='grow pl-2 text-left'>
          <div className='text-sm leading-4'>Team</div>
          <div className='font-semibold text-xl leading-5'>{name}</div>
        </div>
      </SelectTrigger>
      <SelectContent position='popper'>
        {onShareToOrg ? (
          <div className='w-88 p-4'>
            <div>
              This custom activity is private to the <b>{selectedTeam.name}</b> team.
            </div>
            <br />
            <div>
              As a member of the team you can share this activity with other teams at the{' '}
              <b>{selectedTeam.organization.name}</b> organization so that they can also use the
              activity.
            </div>
            <button
              onPointerDown={(e) => {
                e.stopPropagation()
                onShareToOrg()
              }}
              className='mt-4 flex w-max cursor-pointer items-center rounded-full border border-slate-400 border-solid bg-white px-3 py-2 text-center font-sans font-semibold text-slate-700 text-sm hover:bg-slate-100'
            >
              <LockOpen style={{marginRight: '8px', color: PALETTE.SLATE_600}} />
              Allow other teams to use this activity
            </button>
          </div>
        ) : (
          <SelectGroup>
            <div className='px-3 py-2 font-semibold text-base'>Select Team:</div>
            <div className='border-slate-300 border-b' />
            <div className='py-2'>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id} checkClassName='text-grape-700'>
                  {team.name}
                </SelectItem>
              ))}
            </div>
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  )
}

export default NewMeetingTeamPicker
