import React, {useState} from 'react'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import StartRetrospectiveMutation from '~/mutations/StartRetrospectiveMutation'
import StartSprintPokerMutation from '~/mutations/StartSprintPokerMutation'
import {ActivityDetailsSidebar_template$key} from '~/__generated__/ActivityDetailsSidebar_template.graphql'
import {ActivityDetailsSidebar_teams$key} from '~/__generated__/ActivityDetailsSidebar_teams.graphql'
import NewMeetingTeamPicker from '../NewMeetingTeamPicker'
import {MenuPosition} from '../../hooks/useCoords'
import sortByTier from '../../utils/sortByTier'
import NewMeetingSettingsToggleCheckIn from '../NewMeetingSettingsToggleCheckIn'
import NewMeetingSettingsToggleAnonymity from '../NewMeetingSettingsToggleAnonymity'
import NewMeetingActionsCurrentMeetings from '../NewMeetingActionsCurrentMeetings'
import FlatPrimaryButton from '../FlatPrimaryButton'
import SelectTemplateMutation from '../../mutations/SelectTemplateMutation'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import {useHistory} from 'react-router'
import clsx from 'clsx'

interface Props {
  selectedTemplateRef: ActivityDetailsSidebar_template$key
  teamsRef: ActivityDetailsSidebar_teams$key
  isOpen: boolean
}

const ActivityDetailsSidebar = (props: Props) => {
  const {selectedTemplateRef, teamsRef, isOpen} = props
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
          ...NewMeetingSettingsToggleAnonymity_settings
        }
        pokerSettings: meetingSettings(meetingType: poker) {
          ...NewMeetingSettingsToggleCheckIn_settings
        }
        ...NewMeetingTeamPicker_selectedTeam
        ...NewMeetingTeamPicker_teams
        ...NewMeetingActionsCurrentMeetings_team
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
      : templateTeam
      ? [templateTeam]
      : []

  const [selectedTeam, setSelectedTeam] = useState(templateTeam ?? sortByTier(availableTeams)[0]!)
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()
  const history = useHistory()

  const handleStartRetro = () => {
    if (submitting) return
    submitMutation()
    SelectTemplateMutation(
      atmosphere,
      {selectedTemplateId: selectedTemplate.id, teamId: selectedTeam.id},
      {
        onCompleted: () => {
          if (selectedTemplate.type === 'retrospective') {
            StartRetrospectiveMutation(
              atmosphere,
              {teamId: selectedTeam.id},
              {history, onError, onCompleted}
            )
          } else if (selectedTemplate.type === 'poker') {
            StartSprintPokerMutation(
              atmosphere,
              {teamId: selectedTeam.id},
              {history, onError, onCompleted}
            )
          }
        },
        onError
      }
    )
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
          {availableTeams.length > 0 && (
            <NewMeetingTeamPicker
              positionOverride={MenuPosition.UPPER_LEFT}
              onSelectTeam={(teamId) => {
                const newTeam = availableTeams.find((team) => team.id === teamId)
                newTeam && setSelectedTeam(newTeam)
              }}
              selectedTeamRef={selectedTeam}
              teamsRef={availableTeams}
            />
          )}

          {selectedTemplate.type === 'retrospective' && (
            <>
              <NewMeetingSettingsToggleCheckIn settingsRef={selectedTeam.retroSettings} />
              <NewMeetingSettingsToggleAnonymity settingsRef={selectedTeam.retroSettings} />
            </>
          )}
          {selectedTemplate.type === 'poker' && (
            <NewMeetingSettingsToggleCheckIn settingsRef={selectedTeam.pokerSettings} />
          )}
          <div className='flex grow flex-col justify-end gap-2'>
            <NewMeetingActionsCurrentMeetings noModal={true} team={selectedTeam} />
            <FlatPrimaryButton onClick={handleStartRetro} waiting={submitting} className='h-14'>
              <div className='text-lg'>Start Activity</div>
            </FlatPrimaryButton>
          </div>
        </div>
      </div>
    </>
  )
}

export default ActivityDetailsSidebar
