import {VisuallyHidden} from '@radix-ui/react-visually-hidden'
import graphql from 'babel-plugin-relay/macro'
import {useEffect, useState} from 'react'

import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {TeamPickerModal_teams$key} from '~/__generated__/TeamPickerModal_teams.graphql'
import type {MeetingTypeEnum} from '~/__generated__/TemplateDetails_activity.graphql'
import type {useAddPokerTemplateMutation$data} from '../../__generated__/useAddPokerTemplateMutation.graphql'
import type {useAddReflectTemplateMutation$data} from '../../__generated__/useAddReflectTemplateMutation.graphql'
import type {useAddTeamHealthTemplateMutation$data} from '../../__generated__/useAddTeamHealthTemplateMutation.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useAddPokerTemplateMutation from '../../mutations/useAddPokerTemplateMutation'
import useAddReflectTemplateMutation from '../../mutations/useAddReflectTemplateMutation'
import useAddTeamHealthTemplateMutation from '../../mutations/useAddTeamHealthTemplateMutation'
import {cn} from '../../ui/cn'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogContent} from '../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'
import SendClientSideEvent from '../../utils/SendClientSideEvent'
import sortByTier from '../../utils/sortByTier'
import NewMeetingTeamPicker from '../NewMeetingTeamPicker'

const ACTION_BUTTON_CLASSES =
  'w-max cursor-pointer rounded-full px-4 py-2 text-center font-sans text-base font-medium'

interface Props {
  preferredTeamId: string | null | undefined
  teamsRef: TeamPickerModal_teams$key
  category: string
  parentTemplateId: string
  type: MeetingTypeEnum
  isOpen: boolean
  closeModal: () => void
}

const TeamPickerModal = (props: Props) => {
  const {teamsRef, category, parentTemplateId, type, preferredTeamId, isOpen, closeModal} = props
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

  const [selectedTeam, setSelectedTeam] = useState(
    teams.find((team) => team.id === preferredTeamId) ?? sortByTier(teams)[0]
  )

  const atmosphere = useAtmosphere()
  const [error, setError] = useState<string | null>(null)
  const [executeAddReflectTemplate, reflectSubmitting] = useAddReflectTemplateMutation()
  const [executeAddPokerTemplate, pokerSubmitting] = useAddPokerTemplateMutation()
  const [executeAddTeamHealthTemplate, teamHealthSubmitting] = useAddTeamHealthTemplateMutation()
  const submitting = reflectSubmitting || pokerSubmitting || teamHealthSubmitting

  useEffect(() => {
    setError(null)
  }, [selectedTeam?.id])

  const navigate = useNavigate()

  // user has no teams
  if (!selectedTeam) return null

  const onError = (err: Error) => {
    setError(err.message)
  }

  const onTemplateCreated = (templateId: string | undefined) => {
    closeModal()
    if (templateId) {
      navigate(`/activity-library/details/${templateId}`, {
        state: {prevCategory: category, edit: true}
      })
    }
  }

  const handleSelectTeam = () => {
    if (submitting) {
      return
    }

    const variables = {teamId: selectedTeam.id, parentTemplateId}
    setError(null)
    if (type === 'retrospective') {
      executeAddReflectTemplate({
        variables,
        onError,
        onCompleted: (res: useAddReflectTemplateMutation$data) =>
          onTemplateCreated(res.addReflectTemplate?.reflectTemplate?.id)
      })
    } else if (type === 'poker') {
      executeAddPokerTemplate({
        variables,
        onError,
        onCompleted: (res: useAddPokerTemplateMutation$data) =>
          onTemplateCreated(res.addPokerTemplate?.pokerTemplate?.id)
      })
    } else if (type === 'teamHealth') {
      executeAddTeamHealthTemplate({
        variables,
        onError,
        onCompleted: (res: useAddTeamHealthTemplateMutation$data) =>
          onTemplateCreated(res.addTeamHealthTemplate?.teamHealthTemplate?.id)
      })
    }
  }

  const handleUpgrade = () => {
    SendClientSideEvent(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation: 'cloneTemplateAL',
      meetingType: type
    })
    navigate(`/me/organizations/${selectedTeam.orgId}/billing`)
  }

  return (
    <Dialog isOpen={isOpen} onClose={closeModal}>
      <DialogContent className='w-[440px] p-6'>
        <VisuallyHidden asChild>
          <DialogTitle>Select a team to clone this template</DialogTitle>
        </VisuallyHidden>
        <div className='flex flex-col gap-4'>
          <div>
            <b>Select the team</b> to manage this cloned template
          </div>
          <NewMeetingTeamPicker
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
          {error && <div className='w-full text-tomato-500'>{error}</div>}
          <div className='flex gap-2.5 self-end'>
            <button
              className={cn(
                ACTION_BUTTON_CLASSES,
                'border border-slate-400 border-solid bg-white text-slate-700 hover:bg-slate-200'
              )}
              onClick={closeModal}
            >
              Cancel
            </button>
            {selectedTeam.tier === 'starter' ? (
              <button
                className={cn(
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
                className={cn(
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
      </DialogContent>
    </Dialog>
  )
}

export default TeamPickerModal
