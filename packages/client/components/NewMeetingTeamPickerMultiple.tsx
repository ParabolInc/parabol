import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {NewMeetingTeamPickerMultiple_teams$key} from '~/__generated__/NewMeetingTeamPickerMultiple_teams.graphql'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItemCheckbox} from '../ui/Menu/MenuItemCheckbox'

interface Props {
  teamsRef: NewMeetingTeamPickerMultiple_teams$key
  selectedTeamIds: string[]
  onToggleTeam: (teamId: string) => void
}

const NewMeetingTeamPickerMultiple = (props: Props) => {
  const {teamsRef, selectedTeamIds, onToggleTeam} = props
  const teams = useFragment(
    graphql`
      fragment NewMeetingTeamPickerMultiple_teams on Team @relay(plural: true) {
        id
        name
      }
    `,
    teamsRef
  )

  const selectedTeams = teams.filter((team) => selectedTeamIds.includes(team.id))
  const summary =
    selectedTeams.length === 0
      ? 'Select teams'
      : selectedTeams.length <= 2
        ? selectedTeams.map((team) => team.name).join(', ')
        : `${selectedTeams.length} teams`

  return (
    <Menu
      trigger={
        <button
          type='button'
          className='flex h-auto w-full cursor-pointer items-center rounded-sm border-0 bg-slate-200 p-2 text-left hover:bg-slate-300'
        >
          <div className='grow pl-2'>
            <div className='text-sm leading-4'>Teams</div>
            <div className='truncate font-semibold text-xl leading-5'>{summary}</div>
          </div>
          <KeyboardArrowDownIcon className='mr-2' />
        </button>
      }
    >
      <MenuContent align='start' sideOffset={4} className='max-h-80 w-88 overflow-auto'>
        <div className='px-3 py-2 font-semibold text-base'>Select Teams:</div>
        <div className='border-slate-300 border-b' />
        <div className='py-2'>
          {teams.map((team) => (
            <MenuItemCheckbox
              key={team.id}
              checked={selectedTeamIds.includes(team.id)}
              onClick={() => onToggleTeam(team.id)}
            >
              {team.name}
            </MenuItemCheckbox>
          ))}
        </div>
      </MenuContent>
    </Menu>
  )
}

export default NewMeetingTeamPickerMultiple
