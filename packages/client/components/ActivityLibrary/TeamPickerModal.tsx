import React, {useEffect, useState} from 'react'
import graphql from 'babel-plugin-relay/macro'

import NewMeetingTeamPicker from '../NewMeetingTeamPicker'
import {MenuPosition} from '../../hooks/useCoords'
import {TeamPickerModal_templates$key} from '~/__generated__/TeamPickerModal_templates.graphql'
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

interface TeamPickerModalProps {
  teamsRef: TeamPickerModal_teams$key
  templatesRef: TeamPickerModal_templates$key
  closePortal: () => void
  category: string
}

const TeamPickerModal = (props: TeamPickerModalProps) => {
  const {teamsRef, templatesRef, closePortal, category} = props
  const teams = useFragment(
    graphql`
      fragment TeamPickerModal_teams on Team @relay(plural: true) {
        id
        tier
        name
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
        teamId
      }
    `,
    templatesRef
  )

  const [selectedTeam, setSelectedTeam] = useState(sortByTier(teams)[0]!)

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

    const teamTemplates = templates.filter((template) => template.teamId === selectedTeam.id)

    if (teamTemplates.length >= Threshold.MAX_RETRO_TEAM_TEMPLATES) {
      onError(new Error('You may only have 20 templates per team. Please remove one first.'))
      return
    }
    if (teamTemplates.find((template) => template.name === '*New Template')) {
      onError(new Error('You already have a new template. Try renaming that one first.'))
      return
    }

    closePortal()

    submitMutation()
    AddReflectTemplateMutation(
      atmosphere,
      {teamId: selectedTeam.id},
      {
        onError,
        onCompleted: (res: AddReflectTemplateMutation$data) => {
          const templateId = res.addReflectTemplate?.reflectTemplate?.id
          if (templateId) {
            history.push(`/activity-library/details/${templateId}`, {
              prevCategory: category
            })
          }
          onCompleted()
        }
      }
    )
  }

  return (
    <div className='w-[440px] bg-white p-6'>
      <div className='flex flex-col gap-4'>
        <div>
          <b>Select the team</b> to manage this new activity template:
        </div>
        <NewMeetingTeamPicker
          parentId='templateTeamPickerModal'
          positionOverride={MenuPosition.UPPER_LEFT}
          onSelectTeam={(teamId) => {
            const newTeam = teams.find((team) => team.id === teamId)
            newTeam && setSelectedTeam(newTeam)
          }}
          selectedTeamRef={selectedTeam}
          teamsRef={teams}
        />
        {error?.message && <div className='w-full text-tomato-500'>{error.message}</div>}
        <button
          className={clsx(
            'w-max cursor-pointer self-end rounded-full bg-sky-500 px-4 py-2 text-center font-sans text-base font-medium text-white hover:bg-sky-600'
          )}
          onClick={handleSelectTeam}
        >
          Select Team
        </button>
      </div>
    </div>
  )
}

export default TeamPickerModal
