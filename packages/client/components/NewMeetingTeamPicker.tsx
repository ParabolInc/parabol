import {ExpandMore, LockOpen} from '@mui/icons-material'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {NewMeetingTeamPicker_selectedTeam$key} from '~/__generated__/NewMeetingTeamPicker_selectedTeam.graphql'
import {NewMeetingTeamPicker_teams$key} from '~/__generated__/NewMeetingTeamPicker_teams.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {PALETTE} from '../styles/paletteV3'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
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

  const {name} = selectedTeam

  return (
    <Menu
      trigger={
        <div className='group flex cursor-pointer items-center rounded-md bg-slate-200 p-2 hover:bg-slate-300'>
          <div className='p-2'>
            <NewMeetingTeamPickerAvatars teamRef={selectedTeam} />
          </div>
          <div className='grow pl-2'>
            <div className='text-sm leading-4'>Team</div>
            <div className='text-xl leading-5 font-semibold'>{name}</div>
          </div>
          <div className='s-6 p-2 pl-0'>
            <ExpandMore className='text-4xl text-slate-600 transition-transform group-data-[state=open]:rotate-180' />
          </div>
        </div>
      }
    >
      <MenuContent>
        <div className='w-[var(--radix-dropdown-menu-trigger-width)]'>
          {onShareToOrg ? (
            <div className='w-[352px] p-4'>
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
                onClick={onShareToOrg}
                className={
                  'mt-4 flex w-max cursor-pointer items-center rounded-full border border-solid border-slate-400 bg-white px-3 py-2 text-center font-sans text-sm font-semibold text-slate-700 hover:bg-slate-100'
                }
              >
                <LockOpen style={{marginRight: '8px', color: PALETTE.SLATE_600}} />
                Allow other teams to use this activity
              </button>
            </div>
          ) : (
            <>
              <DropdownMenu.Label className='px-3 py-2 text-base font-semibold'>
                Select Team:
              </DropdownMenu.Label>
              <DropdownMenu.Separator className='border-b border-slate-300' />
              <div className='py-2'>
                {teams.map((team) => {
                  return (
                    <DropdownMenu.Item
                      key={team.id}
                      className='px-3 py-1 text-base outline-hidden hover:bg-slate-200'
                      onClick={() => {
                        handleSelectTeam(team.id)
                      }}
                    >
                      {team.name}
                    </DropdownMenu.Item>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </MenuContent>
    </Menu>
  )
}

export default NewMeetingTeamPicker
