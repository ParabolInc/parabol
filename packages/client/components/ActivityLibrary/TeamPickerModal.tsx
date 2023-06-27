import React, {useEffect, useState} from 'react'
import graphql from 'babel-plugin-relay/macro'

import NewMeetingTeamPicker from '../NewMeetingTeamPicker'
import {MenuPosition} from '../../hooks/useCoords'
import {
  MeetingTypeEnum,
  TeamPickerModal_templates$key
} from '~/__generated__/TeamPickerModal_templates.graphql'
import {TeamPickerModal_teams$key} from '~/__generated__/TeamPickerModal_teams.graphql'
import sortByTier from '../../utils/sortByTier'
import useMutationProps from '../../hooks/useMutationProps'
import useAtmosphere from '../../hooks/useAtmosphere'
import AddReflectTemplateMutation from '../../mutations/AddReflectTemplateMutation'
import {AddReflectTemplateMutation$data} from '~/__generated__/AddReflectTemplateMutation.graphql'
import {useHistory} from 'react-router'
import {Threshold} from '../../types/constEnums'
import {useFragment} from 'react-relay'
import clsx from 'clsx'
import AddPokerTemplateMutation from '../../mutations/AddPokerTemplateMutation'
import {AddPokerTemplateMutation$data} from '../../__generated__/AddPokerTemplateMutation.graphql'
import SendClientSegmentEventMutation from '../../mutations/SendClientSegmentEventMutation'

const ACTION_BUTTON_CLASSES =
  'w-max cursor-pointer rounded-full px-4 py-2 text-center font-sans text-base font-medium'

interface Props {
  teamsRef: TeamPickerModal_teams$key
  preferredTeamId: string | null
  templatesRef: TeamPickerModal_templates$key
  closePortal: () => void
  category: string
  parentTemplateId: string
  type: MeetingTypeEnum
}

const TeamPickerModal = (props: Props) => {
  const {teamsRef, templatesRef, closePortal, category, parentTemplateId, type, preferredTeamId} =
    props
  const teams = useFragment(
    graphql`
      fragment TeamPickerModal_teams on Team @relay(plural: true) {
        id
        tier
        name
        orgId
        ...NewMeetingTeamPicker_selectedTeam
        ...NewMeetingTeamPicker_teams
      }
    `,
    teamsRef
  )

  const templates = useFragment(
    graphql`
      fragment TeamPickerModal_templates on MeetingTemplate @relay(plural: true) {
        name
        type
        teamId
      }
    `,
    templatesRef
  )

  const [selectedTeam, setSelectedTeam] = useState(
    teams.find((team) => team.id === preferredTeamId) ?? sortByTier(teams)[0]!
  )

  const atmosphere = useAtmosphere()
  const {submitting, error, submitMutation, onError, onCompleted} = useMutationProps()

  useEffect(() => {
    onCompleted()
  }, [selectedTeam.id])

  const history = useHistory()

  const handleSelectTeam = () => {
    if (submitting) {
      return
    }

    const teamTemplates = templates.filter(
      (template) => template.teamId === selectedTeam.id && template.type === type
    )

    if (
      teamTemplates.length >=
      (type === 'retrospective'
        ? Threshold.MAX_RETRO_TEAM_TEMPLATES
        : Threshold.MAX_POKER_TEAM_TEMPLATES)
    ) {
      onError(new Error('You may only have 20 templates per team. Please remove one first.'))
      return
    }

    if (type === 'retrospective') {
      submitMutation()
      AddReflectTemplateMutation(
        atmosphere,
        {teamId: selectedTeam.id, parentTemplateId},
        {
          onError,
          onCompleted: (res: AddReflectTemplateMutation$data) => {
            closePortal()
            const templateId = res.addReflectTemplate?.reflectTemplate?.id
            if (templateId) {
              history.push(`/activity-library/details/${templateId}`, {
                prevCategory: category,
                edit: true
              })
            }
            onCompleted()
          }
        }
      )
    } else if (type === 'poker') {
      submitMutation()
      AddPokerTemplateMutation(
        atmosphere,
        {teamId: selectedTeam.id, parentTemplateId},
        {
          onError,
          onCompleted: (res: AddPokerTemplateMutation$data) => {
            closePortal()
            const templateId = res.addPokerTemplate?.pokerTemplate?.id
            if (templateId) {
              history.push(`/activity-library/details/${templateId}`, {
                prevCategory: category,
                edit: true
              })
            }
            onCompleted()
          }
        }
      )
    }
  }

  const handleUpgrade = () => {
    SendClientSegmentEventMutation(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation: 'cloneTemplateAL',
      meetingType: type
    })
    history.push(`/me/organizations/${selectedTeam.orgId}/billing`)
  }

  return (
    <div className='w-[440px] bg-white p-6'>
      <div className='flex flex-col gap-4'>
        <div>
          <b>Select the team</b> to manage this cloned template
        </div>
        <NewMeetingTeamPicker
          positionOverride={MenuPosition.UPPER_LEFT}
          onSelectTeam={(teamId) => {
            const newTeam = teams.find((team) => team.id === teamId)
            newTeam && setSelectedTeam(newTeam)
          }}
          selectedTeamRef={selectedTeam}
          teamsRef={teams}
        />
        {selectedTeam.tier === 'starter' && (
          <div>
            This team is on the <b>Starter</b> plan. <b>Upgrade</b> to clone and edit templates on
            this team.
          </div>
        )}
        {error?.message && <div className='w-full text-tomato-500'>{error.message}</div>}
        <div className='flex gap-2.5 self-end'>
          <button
            className={clsx(
              ACTION_BUTTON_CLASSES,
              'border border-solid border-slate-400 bg-white text-slate-700 hover:bg-slate-200'
            )}
            onClick={closePortal}
          >
            Cancel
          </button>
          {selectedTeam.tier === 'starter' ? (
            <button
              className={clsx(
                ACTION_BUTTON_CLASSES,
                'bg-rose-500 px-4 py-2 text-white hover:bg-rose-600',
                submitting && 'cursor-wait'
              )}
              onClick={handleUpgrade}
            >
              Upgrade Now
            </button>
          ) : (
            <button
              className={clsx(
                ACTION_BUTTON_CLASSES,
                'bg-sky-500 px-4 py-2 text-white hover:bg-sky-600',
                submitting && 'cursor-wait'
              )}
              onClick={handleSelectTeam}
            >
              Clone Template
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TeamPickerModal
