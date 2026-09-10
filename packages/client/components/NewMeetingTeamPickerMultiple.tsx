import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {NewMeetingTeamPickerMultiple_teams$key} from '~/__generated__/NewMeetingTeamPickerMultiple_teams.graphql'
import {KeyboardArrowDown as KeyboardArrowDownIcon} from '~/ui/icons'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItemCheckbox} from '../ui/Menu/MenuItemCheckbox'
import {Tooltip} from '../ui/Tooltip/Tooltip'
import {TooltipContent} from '../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../ui/Tooltip/TooltipTrigger'

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
        orgId
        organization {
          name
        }
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

  // the org disambiguates same-named teams only when the viewer can see teams from more than one
  const isMultiOrg = new Set(teams.map(({orgId}) => orgId)).size > 1
  // a series group is owned by a single org, so the first pick locks the org for the rest
  const selectedOrgId = selectedTeams[0]?.orgId

  return (
    <Menu
      trigger={
        <button
          type='button'
          className='flex h-auto w-full cursor-pointer items-center rounded-sm border-0 bg-surface-well p-2 text-left hover:bg-surface-hover'
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
        <div className='border-hairline border-b' />
        <div className='py-2'>
          {teams.map((team) => {
            const isDisabled = !!selectedOrgId && team.orgId !== selectedOrgId
            const item = (
              <MenuItemCheckbox
                key={team.id}
                checked={selectedTeamIds.includes(team.id)}
                disabled={isDisabled}
                onClick={() => !isDisabled && onToggleTeam(team.id)}
              >
                <div>{team.name}</div>
                {isMultiOrg && (
                  <div className='text-fg-muted text-xs'>{team.organization.name}</div>
                )}
              </MenuItemCheckbox>
            )
            if (!isDisabled) return item
            return (
              <Tooltip key={team.id}>
                <TooltipTrigger asChild>{item}</TooltipTrigger>
                <TooltipContent side='right' className='max-w-56 whitespace-normal'>
                  {'A meeting series can only include teams from the same organization'}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </MenuContent>
    </Menu>
  )
}

export default NewMeetingTeamPickerMultiple
