import graphql from 'babel-plugin-relay/macro'
import {useEffect, useState} from 'react'

import clsx from 'clsx'
import {useFragment} from 'react-relay'
import {useHistory} from 'react-router'
import {AddReflectTemplateMutation$data} from '~/__generated__/AddReflectTemplateMutation.graphql'
import {TeamPickerModal_teams$key} from '~/__generated__/TeamPickerModal_teams.graphql'
import {MeetingTypeEnum} from '~/__generated__/TemplateDetails_activity.graphql'
import {AddPokerTemplateMutation$data} from '../../__generated__/AddPokerTemplateMutation.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import AddPokerTemplateMutation from '../../mutations/AddPokerTemplateMutation'
import AddReflectTemplateMutation from '../../mutations/AddReflectTemplateMutation'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogContent} from '../../ui/Dialog/DialogContent'
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
  const {submitting, error, submitMutation, onError, onCompleted} = useMutationProps()

  useEffect(() => {
    onCompleted()
  }, [selectedTeam?.id])

  const history = useHistory()

  // user has no teams
  if (!selectedTeam) return null

  const handleSelectTeam = () => {
    if (submitting) {
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
            closeModal()
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
            closeModal()
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
    SendClientSideEvent(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation: 'cloneTemplateAL',
      meetingType: type
    })
    history.push(`/me/organizations/${selectedTeam.orgId}/billing`)
  }

  return (
    <Dialog isOpen={isOpen} onClose={closeModal}>
      <DialogContent className='w-[440px] p-6'>
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
          {error?.message && <div className='w-full text-tomato-500'>{error.message}</div>}
          <div className='flex gap-2.5 self-end'>
            <button
              className={clsx(
                ACTION_BUTTON_CLASSES,
                'border border-solid border-slate-400 bg-white text-slate-700 hover:bg-slate-200'
              )}
              onClick={closeModal}
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
      </DialogContent>
    </Dialog>
  )
}

export default TeamPickerModal
