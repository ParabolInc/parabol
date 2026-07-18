import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {RRule} from 'rrule'
import type {TeamHealthDetailsSidebar_teams$key} from '~/__generated__/TeamHealthDetailsSidebar_teams.graphql'
import type {CreateGcalEventInput} from '../../__generated__/useStartTeamHealthMutation.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import useStartTeamHealthMutation from '../../mutations/useStartTeamHealthMutation'
import {cn} from '../../ui/cn'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogContent} from '../../ui/Dialog/DialogContent'
import {DialogTrigger} from '../../ui/Dialog/DialogTrigger'
import sortByTier from '../../utils/sortByTier'
import FlatPrimaryButton from '../FlatPrimaryButton'
import NewMeetingTeamPickerMultiple from '../NewMeetingTeamPickerMultiple'
import {ScheduleDialog} from '../ScheduleDialog'
import StyledLink from '../StyledLink'

interface Props {
  templateId: string
  teamsRef: TeamHealthDetailsSidebar_teams$key
  preferredTeamId: string | null | undefined
}

const TeamHealthDetailsSidebar = (props: Props) => {
  const {templateId, teamsRef, preferredTeamId} = props
  const teams = useFragment(
    graphql`
      fragment TeamHealthDetailsSidebar_teams on Team @relay(plural: true) {
        id
        name
        tier
        ...NewMeetingTeamPickerMultiple_teams
        ...ScheduleDialog_team
      }
    `,
    teamsRef
  )

  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const [isMinimized, setIsMinimized] = useState(false)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [execute, submitting] = useStartTeamHealthMutation()
  // ScheduleDialog drives the Google Calendar OAuth flow through the legacy mutationProps shape
  const mutationProps = useMutationProps()

  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>(() => {
    const defaultTeam = teams.find((team) => team.id === preferredTeamId) ?? sortByTier(teams)[0]
    return defaultTeam ? [defaultTeam.id] : []
  })

  // viewer has no teams to run a team health meeting with
  if (teams.length === 0) {
    return (
      <div className='flex w-full flex-col items-center border-slate-300 border-t border-solid bg-white px-4 pt-2 lg:top-0 lg:right-0 lg:h-full lg:w-96 lg:flex-1 lg:border-l lg:pt-14'>
        <div className='self-center italic'>You have no teams to start a meeting with!</div>
        <StyledLink to='/newteam'>Create a team</StyledLink>
      </div>
    )
  }

  const onToggleTeam = (teamId: string) => {
    setSelectedTeamIds((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    )
  }

  // the Google Calendar UI in the dialog is scoped to a single team member's integration
  const gcalTeam = teams.find((team) => team.id === selectedTeamIds[0]) ?? teams[0]!

  const handleStartActivity = (name?: string, rrule?: RRule, gcalInput?: CreateGcalEventInput) => {
    if (submitting || selectedTeamIds.length === 0) return
    execute({
      variables: {
        teamIds: selectedTeamIds,
        templateId,
        name,
        rrule: rrule?.toString(),
        gcalInput
      },
      onCompleted: (res) => {
        setIsScheduleOpen(false)
        const {meetings, teams: startedTeams} = res.startTeamHealth
        // an immediate (non-recurring) meeting was created for a single team → jump right in
        if (selectedTeamIds.length === 1 && meetings[0]) {
          navigate(`/meet/${meetings[0].id}`)
          return
        }
        const teamCount = startedTeams.length
        const verb = meetings.length > 0 ? 'Started' : 'Scheduled'
        atmosphere.eventEmitter.emit('addSnackbar', {
          key: 'startTeamHealth',
          autoDismiss: 5,
          message: `${verb} Team Health for ${teamCount} team${teamCount === 1 ? '' : 's'}`
        })
      }
    })
  }

  return (
    <div className='sticky bottom-0 flex w-full flex-col border-slate-300 border-t border-solid bg-white px-4 pt-2 lg:top-0 lg:right-0 lg:h-screen lg:w-96 lg:border-l lg:pt-14'>
      <div className='grow'>
        <div className='flex items-center justify-between pt-2 font-semibold text-xl lg:pt-0'>
          Settings
          <span
            className='hover:cursor-pointer lg:hidden'
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </span>
        </div>

        <div
          className={cn(
            'transition-max-height duration-300 ease-in-out',
            isMinimized
              ? 'max-h-0 opacity-0 lg:max-h-[100vh] lg:opacity-100'
              : 'max-h-[100vh] pb-4 lg:pb-0'
          )}
        >
          <div className='mt-6 flex grow flex-col gap-2'>
            <NewMeetingTeamPickerMultiple
              teamsRef={teams}
              selectedTeamIds={selectedTeamIds}
              onToggleTeam={onToggleTeam}
            />
          </div>
        </div>
      </div>

      <div className='z-10 flex h-fit w-full flex-col gap-2 pb-4'>
        <Dialog isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)}>
          <DialogTrigger>
            <FlatPrimaryButton
              onClick={() => setIsScheduleOpen(true)}
              waiting={submitting}
              disabled={selectedTeamIds.length === 0}
              className='h-14'
            >
              <div className='text-lg'>Schedule Meeting</div>
            </FlatPrimaryButton>
          </DialogTrigger>
          <DialogContent noClose>
            <ScheduleDialog
              teamRef={gcalTeam}
              placeholder='Team Health'
              onStartActivity={handleStartActivity}
              onCancel={() => setIsScheduleOpen(false)}
              mutationProps={mutationProps}
              withRecurrence
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default TeamHealthDetailsSidebar
