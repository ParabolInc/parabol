import {useState} from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import useRouter from '../hooks/useRouter'
import ArchiveTeamMutation from '../mutations/ArchiveTeamMutation'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogActions} from '../ui/Dialog/DialogActions'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'
import {Input} from '../ui/Input/Input'
import FlatPrimaryButton from './FlatPrimaryButton'
import SecondaryButton from './SecondaryButton'

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

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className='z-10'>
        <DialogTitle className='mb-4'>Delete Team</DialogTitle>

        <fieldset className='mx-0 mb-6 flex w-full flex-col p-0'>
          <label className='mb-3 text-left text-sm font-semibold text-slate-600'>
            Please type your team name to confirm. <b>This action can't be undone.</b>
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
