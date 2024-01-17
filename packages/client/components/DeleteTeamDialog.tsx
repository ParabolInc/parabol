import React, {useState} from 'react'
import FlatPrimaryButton from './FlatPrimaryButton'
import {Input} from '../ui/Input/Input'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'
import {DialogActions} from '../ui/Dialog/DialogActions'
import useMutationProps from '../hooks/useMutationProps'
import SecondaryButton from './SecondaryButton'
import ArchiveTeamMutation from '../mutations/ArchiveTeamMutation'
import useAtmosphere from '../hooks/useAtmosphere'
import useRouter from '../hooks/useRouter'

interface Props {
  isOpen: boolean
  onClose: () => void
  onDeleteTeam: (teamId: string) => void
  teamId: string
  teamName: string
  teamOrgId: string
}

const DeleteTeamDialog = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {isOpen, onClose, teamId, teamName, teamOrgId, onDeleteTeam} = props

  const {submitting, onCompleted, onError, error, submitMutation} = useMutationProps()

  const [typedTeamName, setTypedTeamName] = useState(false)

  const handleDeleteTeam = () => {
    if (submitting) return
    submitMutation()
    ArchiveTeamMutation(atmosphere, {teamId}, {history, onError, onCompleted})
    onDeleteTeam(teamId)
    history.push(`/me/organizations/${teamOrgId}/teams`)
  }

  const labelStyles = `text-left text-sm font-semibold mb-3 text-slate-600`
  const fieldsetStyles = `mx-0 mb-6 flex flex-col w-full p-0`

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className='z-10'>
        <DialogTitle className='mb-4'>Delete Team</DialogTitle>

        <fieldset className={fieldsetStyles}>
          <label className={labelStyles}>
            Please type your team name to confirm and hit Enter to delete it.
          </label>
          <Input
            autoFocus
            onChange={(e) => {
              e.preventDefault()
              if (e.target.value === teamName) setTypedTeamName(true)
              else setTypedTeamName(false)
            }}
            placeholder={teamName}
          />
          {error && (
            <div className='mt-2 text-sm font-semibold text-tomato-500'>{error.message}</div>
          )}
        </fieldset>

        <DialogActions>
          <FlatPrimaryButton size='medium' onClick={handleDeleteTeam} disabled={!typedTeamName}>
            I understand the consequences, delete this team
          </FlatPrimaryButton>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteTeamDialog
