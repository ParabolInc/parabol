import {useNavigate} from 'react-router'
import IconLabel from '../../../../components/IconLabel'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import RemoveOrgUsersMutation from '../../../../mutations/RemoveOrgUsersMutation'
import {Button} from '../../../../ui/Button/Button'
import {Dialog} from '../../../../ui/Dialog/Dialog'
import {DialogActions} from '../../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'
import getMutationError from '../../../../utils/relay/getMutationError'

interface Props {
  isOpen: boolean
  orgId: string
  closePortal: () => void
}

const LeaveOrgModal = (props: Props) => {
  const {isOpen, orgId, closePortal} = props
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const {onCompleted, onError, submitMutation, submitting, error} = useMutationProps({
    errorDisplay: 'inline'
  })
  const handleClick = () => {
    if (submitting) return
    submitMutation()
    RemoveOrgUsersMutation(
      atmosphere,
      {orgId, userIds: [atmosphere.viewerId]},
      {
        navigate,
        onError,
        onCompleted: (res, errors) => {
          onCompleted(res, errors)
          if (getMutationError(res, errors)) return
          closePortal()
        }
      }
    )
  }
  return (
    <Dialog isOpen={isOpen} onClose={closePortal}>
      <DialogContent>
        <DialogTitle>Are you sure?</DialogTitle>
        <p>This will remove you from the organization and all teams under it!</p>
        <p>To undo it, you'll have to ask another Billing Leader to re-add you.</p>
        {error && <div className='mt-4 font-semibold text-fg-error text-sm'>{error.message}</div>}
        <DialogActions>
          <Button variant='outline' size='md' onClick={closePortal}>
            Cancel
          </Button>
          <Button variant='primary' size='md' onClick={handleClick} disabled={submitting}>
            <IconLabel icon='arrow_forward' iconAfter label='Leave the organization' />
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default LeaveOrgModal
