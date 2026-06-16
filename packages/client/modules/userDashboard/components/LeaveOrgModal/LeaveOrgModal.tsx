import {useNavigate} from 'react-router'
import IconLabel from '../../../../components/IconLabel'
import PrimaryButton from '../../../../components/PrimaryButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import RemoveOrgUsersMutation from '../../../../mutations/RemoveOrgUsersMutation'
import {Dialog} from '../../../../ui/Dialog/Dialog'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'

interface Props {
  isOpen: boolean
  orgId: string
  closePortal: () => void
}

const LeaveOrgModal = (props: Props) => {
  const {isOpen, orgId, closePortal} = props
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const handleClick = () => {
    if (submitting) return
    submitMutation()
    RemoveOrgUsersMutation(
      atmosphere,
      {orgId, userIds: [atmosphere.viewerId]},
      {
        navigate,
        onError,
        onCompleted: () => {
          onCompleted()
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
        <PrimaryButton
          size='medium'
          className='mx-auto mt-6 mb-0'
          onClick={handleClick}
          waiting={submitting}
        >
          <IconLabel icon='arrow_forward' iconAfter label='Leave the organization' />
        </PrimaryButton>
      </DialogContent>
    </Dialog>
  )
}

export default LeaveOrgModal
