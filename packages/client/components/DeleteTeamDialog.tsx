import {useState} from 'react'
import {useNavigate} from 'react-router'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import ArchiveTeamMutation from '../mutations/ArchiveTeamMutation'
import {Button} from '../ui/Button/Button'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogActions} from '../ui/Dialog/DialogActions'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'
import {Input} from '../ui/Input/Input'

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
  const navigate = useNavigate()
  const {isOpen, onClose, teamId, teamName, teamOrgId, onDeleteTeam} = props

  const {submitting, onCompleted, onError, error, submitMutation} = useMutationProps()

  const [typedTeamName, setTypedTeamName] = useState(false)

  const handleDeleteTeam = () => {
    if (submitting) return
    submitMutation()
    ArchiveTeamMutation(atmosphere, {teamId}, {navigate, onError, onCompleted})
    onDeleteTeam(teamId)
    navigate(`/me/organizations/${teamOrgId}/teams`)
  }

  const handleTypeTeamName = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    // Convert smart quote to regular quote before comparison
    if (e.target.value.replaceAll(`’`, `'`) === teamName.replaceAll(`’`, `'`)) {
      setTypedTeamName(true)
    } else {
      setTypedTeamName(false)
    }
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className='z-10'>
        <DialogTitle className='mb-4'>Delete Team</DialogTitle>

        <fieldset className='mx-0 mb-6 flex w-full flex-col p-0'>
          <label className='mb-3 text-left font-semibold text-fg-secondary text-sm'>
            Please type your team name to confirm. <b>This action can't be undone.</b>
          </label>
          <Input autoFocus onChange={handleTypeTeamName} placeholder={teamName} />
          {error && <div className='mt-2 font-semibold text-fg-error text-sm'>{error.message}</div>}
        </fieldset>

        <DialogActions>
          <Button variant='primary' size='md' onClick={handleDeleteTeam} disabled={!typedTeamName}>
            I understand the consequences, delete this team
          </Button>
          <Button variant='outline' size='sm' onClick={onClose}>
            Cancel
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteTeamDialog
