import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import graphql from 'babel-plugin-relay/macro'
import clsx from 'clsx'
import {useEffect, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import {useHistory} from 'react-router'
import {RRule} from 'rrule'
import {ActivityDetailsSidebar_teams$key} from '~/__generated__/ActivityDetailsSidebar_teams.graphql'
import {ActivityDetailsSidebar_template$key} from '~/__generated__/ActivityDetailsSidebar_template.graphql'
import StartRetrospectiveMutation from '~/mutations/StartRetrospectiveMutation'
import StartSprintPokerMutation from '~/mutations/StartSprintPokerMutation'
import UpdateReflectTemplateScopeMutation from '~/mutations/UpdateReflectTemplateScopeMutation'
import {MeetingTypeEnum} from '../../__generated__/ActivityDetailsQuery.graphql'
import {CreateGcalEventInput} from '../../__generated__/StartRetrospectiveMutation.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import SelectTemplateMutation from '../../mutations/SelectTemplateMutation'
import StartCheckInMutation from '../../mutations/StartCheckInMutation'
import StartTeamPromptMutation from '../../mutations/StartTeamPromptMutation'
import sortByTier from '../../utils/sortByTier'
import FlatPrimaryButton from '../FlatPrimaryButton'
import NewMeetingActionsCurrentMeetings from '../NewMeetingActionsCurrentMeetings'
import NewMeetingSettingsToggleAnonymity from '../NewMeetingSettingsToggleAnonymity'
import NewMeetingSettingsToggleCheckIn from '../NewMeetingSettingsToggleCheckIn'
import NewMeetingSettingsToggleTeamHealth from '../NewMeetingSettingsToggleTeamHealth'
import NewMeetingTeamPicker from '../NewMeetingTeamPicker'
import StyledError from '../StyledError'
import StyledLink from '../StyledLink'
import ScheduleMeetingButton from './ScheduleMeetingButton'

interface Props {
  selectedTemplateRef: ActivityDetailsSidebar_template$key
  teamsRef: ActivityDetailsSidebar_teams$key
  type: MeetingTypeEnum
  preferredTeamId: string | null | undefined
}

const ActivityDetailsSidebar = (props: Props) => {
  const {selectedTemplateRef, teamsRef, type, preferredTeamId} = props
  const [isMinimized, setIsMinimized] = useState(false)
  const selectedTemplate = useFragment(
    graphql`
      fragment ActivityDetailsSidebar_template on MeetingTemplate {
        id
        type
        teamId
        orgId
        scope
      }
    `,
    selectedTemplateRef
  )

  const teams = useFragment(
    graphql`
      fragment ActivityDetailsSidebar_teams on Team @relay(plural: true) {
        id
        lastMeetingType
        name
        tier
        orgId
        retroSettings: meetingSettings(meetingType: retrospective) {
          ...NewMeetingSettingsToggleCheckIn_settings
          ...NewMeetingSettingsToggleTeamHealth_settings
          ...NewMeetingSettingsToggleAnonymity_settings
        }
        pokerSettings: meetingSettings(meetingType: poker) {
          ...NewMeetingSettingsToggleCheckIn_settings
        }
        actionSettings: meetingSettings(meetingType: action) {
          ...NewMeetingSettingsToggleCheckIn_settings
        }
        ...NewMeetingSettingsToggleTeamHealth_team
        ...NewMeetingTeamPicker_selectedTeam
        ...NewMeetingTeamPicker_teams
        ...NewMeetingActionsCurrentMeetings_team
        ...ScheduleMeetingButton_team
        ...ScheduleDialog_team
      }
    `,
    teamsRef
  )

  const atmosphere = useAtmosphere()
  const templateTeam = teams.find((team) => team.id === selectedTemplate.teamId)

  const availableTeams =
    selectedTemplate.scope === 'PUBLIC'
      ? teams
      : selectedTemplate.scope === 'ORGANIZATION'
        ? teams.filter((team) => team.orgId === selectedTemplate.orgId)
        : // it is a team-scoped template, templateTeam  must exist
          [templateTeam!]

  const availableTeamsRef = useRef(availableTeams)

  useEffect(() => {
    availableTeamsRef.current = availableTeams
  }, [availableTeams])

  const [selectedTeam, setSelectedTeam] = useState(
    () =>
      availableTeams.find((team) => team.id === preferredTeamId) ??
      templateTeam ??
      sortByTier(availableTeams)[0]
  )

  const onSelectTeam = (teamId: string) => {
    const currentAvailableTeams = availableTeamsRef.current
    const newTeam = currentAvailableTeams.find((team) => team.id === teamId)
    newTeam && setSelectedTeam(newTeam)
  }
  const mutationProps = useMutationProps()
  const {onError, onCompleted, submitting, submitMutation, error} = mutationProps
  const history = useHistory()

  // user has no teams
  if (!selectedTeam)
    return (
      <div className='flex w-full flex-col items-center border-t border-solid border-slate-300 bg-white px-4 pt-2 lg:top-0 lg:right-0 lg:h-full lg:w-96 lg:flex-1 lg:border-l lg:pt-14'>
        <div className='self-center italic'>You have no teams to start a meeting with!</div>
        <StyledLink to='/newteam'>Create a team</StyledLink>
      </div>
    )

  const handleStartActivity = (name?: string, rrule?: RRule, gcalInput?: CreateGcalEventInput) => {
    if (submitting) return
    submitMutation()
    if (type === 'teamPrompt') {
      StartTeamPromptMutation(
        atmosphere,
        {
          teamId: selectedTeam.id,
          name,
          rrule: rrule?.toString(),
          gcalInput
        },
        {history, onError, onCompleted}
      )
    } else if (type === 'action') {
      const variables = {
        teamId: selectedTeam.id,
        gcalInput
      }

      StartCheckInMutation(atmosphere, variables, {history, onError, onCompleted})
    } else {
      SelectTemplateMutation(
        atmosphere,
        {selectedTemplateId: selectedTemplate.id, teamId: selectedTeam.id},
        {
          onCompleted: () => {
            if (type === 'retrospective') {
              StartRetrospectiveMutation(
                atmosphere,
                {
                  teamId: selectedTeam.id,
                  name,
                  rrule: rrule?.toString(),
                  gcalInput
                },
                {history, onError, onCompleted}
              )
            } else if (type === 'poker') {
              StartSprintPokerMutation(
                atmosphere,
                {teamId: selectedTeam.id, gcalInput},
                {history, onError, onCompleted}
              )
            }
          },
          onError
        }
      )
    }
  }

  const handleShareToOrg =
    templateTeam && selectedTemplate.scope === 'TEAM'
      ? () => {
          selectedTemplate &&
            UpdateReflectTemplateScopeMutation(
              atmosphere,
              {scope: 'ORGANIZATION', templateId: selectedTemplate.id},
              {onError, onCompleted}
            )
        }
      : undefined

  const meetingNamePlaceholder =
    type === 'retrospective'
      ? 'Retro'
      : type === 'teamPrompt'
        ? 'Standup'
        : type === 'poker'
          ? 'Poker'
          : type === 'action'
            ? 'Check-in'
            : 'Meeting'
  const withRecurrence = type === 'teamPrompt' || type === 'retrospective'

  return (
    <>
      <div className='sticky bottom-0 flex w-full flex-col border-t border-solid border-slate-300 bg-white px-4 pt-2 lg:top-0 lg:right-0 lg:h-full lg:w-96 lg:flex-1 lg:border-l lg:pt-14'>
        <div className='grow'>
          <div className='flex items-center justify-between pt-2 text-xl font-semibold lg:pt-0'>
            Settings
            <span
              className='hover:cursor-pointer lg:hidden'
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </span>
          </div>

          <div
            className={clsx(
              'transition-max-height duration-300 ease-in-out',
              isMinimized
                ? 'max-h-0 opacity-0 lg:max-h-[100vh] lg:opacity-100'
                : 'max-h-[100vh] pb-4 lg:pb-0'
            )}
          >
            <div className='mt-6 flex grow flex-col gap-2'>
              <NewMeetingTeamPicker
                onSelectTeam={onSelectTeam}
                selectedTeamRef={selectedTeam}
                teamsRef={availableTeams}
                onShareToOrg={handleShareToOrg}
              />
              {type === 'retrospective' && (
                <>
                  <NewMeetingSettingsToggleCheckIn settingsRef={selectedTeam.retroSettings} />
                  <NewMeetingSettingsToggleTeamHealth
                    settingsRef={selectedTeam.retroSettings}
                    teamRef={selectedTeam}
                  />
                  <NewMeetingSettingsToggleAnonymity settingsRef={selectedTeam.retroSettings} />
                </>
              )}
              {type === 'poker' && (
                <NewMeetingSettingsToggleCheckIn settingsRef={selectedTeam.pokerSettings} />
              )}
              {type === 'action' && (
                <NewMeetingSettingsToggleCheckIn settingsRef={selectedTeam.actionSettings} />
              )}
            </div>
          </div>
        </div>

        <div className='z-10 flex h-fit w-full flex-col gap-2 pb-4'>
          {error && <StyledError>{error.message}</StyledError>}
          <NewMeetingActionsCurrentMeetings team={selectedTeam} />
          <ScheduleMeetingButton
            handleStartActivity={handleStartActivity}
            mutationProps={mutationProps}
            teamRef={selectedTeam}
            placeholder={meetingNamePlaceholder}
            withRecurrence={withRecurrence}
          />
          <FlatPrimaryButton
            onClick={() => handleStartActivity()}
            waiting={submitting}
            className='h-14'
          >
            <div className='text-lg'>Start Activity</div>
          </FlatPrimaryButton>
        </div>
      </div>
    </>
  )
}

export default ActivityDetailsSidebar
