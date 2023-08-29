import {LockOpen} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import clsx from 'clsx'
import React, {useState} from 'react'
import {useFragment} from 'react-relay'
import StartSprintPokerMutation from '~/mutations/StartSprintPokerMutation'
import {useHistory} from 'react-router'
import StartRetrospectiveMutation from '~/mutations/StartRetrospectiveMutation'
import UpdateReflectTemplateScopeMutation from '~/mutations/UpdateReflectTemplateScopeMutation'
import {ActivityDetailsSidebar_template$key} from '~/__generated__/ActivityDetailsSidebar_template.graphql'
import {ActivityDetailsSidebar_viewer$key} from '~/__generated__/ActivityDetailsSidebar_viewer.graphql'
import {ActivityDetailsSidebar_teams$key} from '~/__generated__/ActivityDetailsSidebar_teams.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import {MenuPosition} from '../../hooks/useCoords'
import useMutationProps from '../../hooks/useMutationProps'
import SelectTemplateMutation from '../../mutations/SelectTemplateMutation'
import SendClientSegmentEventMutation from '../../mutations/SendClientSegmentEventMutation'
import StartCheckInMutation from '../../mutations/StartCheckInMutation'
import StartTeamPromptMutation from '../../mutations/StartTeamPromptMutation'
import {PALETTE} from '../../styles/paletteV3'
import {CreateGcalEventInput} from '../../__generated__/StartRetrospectiveMutation.graphql'
import sortByTier from '../../utils/sortByTier'
import {MeetingTypeEnum} from '../../__generated__/ActivityDetailsQuery.graphql'
import {RecurrenceSettings} from '../TeamPrompt/Recurrence/RecurrenceSettings'
import NewMeetingSettingsToggleAnonymity from '../NewMeetingSettingsToggleAnonymity'
import NewMeetingSettingsToggleTeamHealth from '../NewMeetingSettingsToggleTeamHealth'
import NewMeetingSettingsToggleCheckIn from '../NewMeetingSettingsToggleCheckIn'
import StyledError from '../StyledError'
import FlatPrimaryButton from '../FlatPrimaryButton'
import NewMeetingActionsCurrentMeetings from '../NewMeetingActionsCurrentMeetings'
import RaisedButton from '../RaisedButton'
import NewMeetingTeamPicker from '../NewMeetingTeamPicker'
import {ActivityDetailsRecurrenceSettings} from './ActivityDetailsRecurrenceSettings'
import {AdhocTeamMultiSelect, Option} from '../AdhocTeamMultiSelect/AdhocTeamMultiSelect'
import ScheduleMeetingButton from './ScheduleMeetingButton'

interface Props {
  selectedTemplateRef: ActivityDetailsSidebar_template$key
  teamsRef: ActivityDetailsSidebar_teams$key
  type: MeetingTypeEnum
  isOpen: boolean
  preferredTeamId: string | null
  viewerRef: ActivityDetailsSidebar_viewer$key
}

const ActivityDetailsSidebar = (props: Props) => {
  const {selectedTemplateRef, teamsRef, type, isOpen, preferredTeamId, viewerRef} = props
  const selectedTemplate = useFragment(
    graphql`
      fragment ActivityDetailsSidebar_template on MeetingTemplate {
        id
        type
        teamId
        orgId
        scope
        isFree
      }
    `,
    selectedTemplateRef
  )

  const viewer = useFragment(
    graphql`
      fragment ActivityDetailsSidebar_viewer on User {
        featureFlags {
          gcal
        }
        ...AdhocTeamMultiSelect_viewer
        ...ScheduleMeetingButton_viewer
      }
    `,
    viewerRef
  )

  const teams = useFragment(
    graphql`
      fragment ActivityDetailsSidebar_teams on Team @relay(plural: true) {
        id
        lastMeetingType
        name
        tier
        orgId
        organization {
          name
        }
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
      }
    `,
    teamsRef
  )

  const atmosphere = useAtmosphere()
  const [recurrenceSettings, setRecurrenceSettings] = useState<RecurrenceSettings>({
    name: '',
    rrule: null
  })

  const templateTeam = teams.find((team) => team.id === selectedTemplate.teamId)

  const availableTeams =
    selectedTemplate.scope === 'PUBLIC'
      ? teams
      : selectedTemplate.scope === 'ORGANIZATION'
      ? teams.filter((team) => team.orgId === selectedTemplate.orgId)
      : // it is a team-scoped template, templateTeam  must exist
        [templateTeam!]

  const [selectedTeam, setSelectedTeam] = useState(
    () =>
      availableTeams.find((team) => team.id === preferredTeamId) ??
      templateTeam ??
      sortByTier(availableTeams)[0]!
  )
  const mutationProps = useMutationProps()
  const {onError, onCompleted, submitting, submitMutation, error} = mutationProps
  const history = useHistory()

  const [selectedUsers, setSelectedUsers] = React.useState<Option[]>([])

  const oneOnOneTeamInput = selectedUsers[0]
    ? {
        email: selectedUsers[0].email,
        // TODO: always pick default orgId for now, this will be changed in next PRs
        orgId: selectedTeam.orgId
      }
    : null

  const handleStartActivity = (gcalInput?: CreateGcalEventInput) => {
    if (submitting) return
    submitMutation()
    if (type === 'teamPrompt') {
      StartTeamPromptMutation(
        atmosphere,
        {
          teamId: selectedTeam.id,
          recurrenceSettings: {
            rrule: recurrenceSettings.rrule?.toString(),
            name: recurrenceSettings.name
          },
          gcalInput
        },
        {history, onError, onCompleted}
      )
    } else if (type === 'action') {
      StartCheckInMutation(
        atmosphere,
        {teamId: !oneOnOneTeamInput ? selectedTeam.id : null, oneOnOneTeamInput, gcalInput},
        {history, onError, onCompleted}
      )
    } else {
      SelectTemplateMutation(
        atmosphere,
        {selectedTemplateId: selectedTemplate.id, teamId: selectedTeam.id},
        {
          onCompleted: () => {
            if (type === 'retrospective') {
              StartRetrospectiveMutation(
                atmosphere,
                {teamId: selectedTeam.id, gcalInput},
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

  const handleShareToOrg = () => {
    selectedTemplate &&
      UpdateReflectTemplateScopeMutation(
        atmosphere,
        {scope: 'ORGANIZATION', templateId: selectedTemplate.id},
        {onError, onCompleted}
      )
  }

  const teamScopePopover = templateTeam && selectedTemplate.scope === 'TEAM' && (
    <div className='w-[352px] p-4'>
      <div>
        This custom activity is private to the <b>{templateTeam.name}</b> team.
      </div>
      <br />
      <div>
        As a member of the team you can share this activity with other teams at the{' '}
        <b>{templateTeam.organization.name}</b> organization so that they can also use the activity.
      </div>
      <button
        onClick={handleShareToOrg}
        className={
          'mt-4 flex w-max cursor-pointer items-center rounded-full border border-solid border-slate-400 bg-white px-3 py-2 text-center font-sans text-sm font-semibold text-slate-700 hover:bg-slate-100'
        }
      >
        <LockOpen style={{marginRight: '8px', color: PALETTE.SLATE_600}} />
        Allow other teams to use this activity
      </button>
    </div>
  )

  const handleUpgrade = () => {
    SendClientSegmentEventMutation(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation: 'publicTemplate',
      meetingType: type
    })
    history.push(`/me/organizations/${selectedTeam.orgId}/billing`)
  }

  return (
    <>
      {isOpen && <div className='w-96' />}
      <div
        className={clsx(
          'fixed right-0 flex h-screen translate-x-0 flex-col border-l border-solid border-slate-300 px-4 pb-9 pt-14 transition-all',
          isOpen ? ' w-96' : 'w-0 overflow-hidden opacity-0'
        )}
      >
        <div className='mb-6 text-xl font-semibold'>Settings</div>

        <div className='flex grow flex-col gap-2'>
          {selectedTemplate.id === 'oneOnOneAction' ? (
            <AdhocTeamMultiSelect
              viewerRef={viewer}
              onChange={(newUsers: Option[]) => {
                setSelectedUsers(newUsers)
              }}
              value={selectedUsers}
            />
          ) : (
            <NewMeetingTeamPicker
              positionOverride={MenuPosition.UPPER_LEFT}
              onSelectTeam={(teamId) => {
                const newTeam = availableTeams.find((team) => team.id === teamId)
                newTeam && setSelectedTeam(newTeam)
              }}
              selectedTeamRef={selectedTeam}
              teamsRef={availableTeams}
              customPortal={teamScopePopover}
            />
          )}

          {selectedTeam.tier === 'starter' && !selectedTemplate.isFree ? (
            <div className='flex grow flex-col'>
              <div className='my-auto text-center'>
                Upgrade to the <b>Team Plan</b> to create custom activities unlocking your team’s
                ideal workflow.
              </div>
              <RaisedButton
                palette='pink'
                className='h-12 w-full text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2'
                onClick={handleUpgrade}
              >
                Upgrade to Team Plan
              </RaisedButton>
            </div>
          ) : (
            <>
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
              {type === 'teamPrompt' && (
                <ActivityDetailsRecurrenceSettings
                  onRecurrenceSettingsUpdated={setRecurrenceSettings}
                  recurrenceSettings={recurrenceSettings}
                />
              )}
              <div className='flex grow flex-col justify-end gap-2'>
                {error && <StyledError>{error.message}</StyledError>}
                <NewMeetingActionsCurrentMeetings team={selectedTeam} />
                <ScheduleMeetingButton
                  handleStartActivity={handleStartActivity}
                  mutationProps={mutationProps}
                  teamRef={selectedTeam}
                  viewerRef={viewer}
                />
                <FlatPrimaryButton
                  onClick={() => handleStartActivity()}
                  waiting={submitting}
                  className='h-14'
                >
                  <div className='text-lg'>Start Activity</div>
                </FlatPrimaryButton>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default ActivityDetailsSidebar
