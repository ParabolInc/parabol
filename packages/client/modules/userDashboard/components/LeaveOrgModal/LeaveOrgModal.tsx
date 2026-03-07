import styled from '@emotion/styled'
import DialogContainer from '../../../../components/DialogContainer'
import DialogContent from '../../../../components/DialogContent'
import DialogTitle from '../../../../components/DialogTitle'
import IconLabel from '../../../../components/IconLabel'
import PrimaryButton from '../../../../components/PrimaryButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import useNavigate from '../../../../hooks/useNavigate'
import RemoveOrgUsersMutation from '../../../../mutations/RemoveOrgUsersMutation'

const StyledButton = styled(PrimaryButton)({
  margin: '1.5rem auto 0'
})

interface Props {
  orgId: string
  closePortal: () => void
}

const StyledDialogContainer = styled(DialogContainer)({
  width: 'auto'
})

const LeaveOrgModal = (props: Props) => {
  const {orgId, closePortal} = props
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
    <StyledDialogContainer>
      <DialogTitle>{'Are you sure?'}</DialogTitle>
      <DialogContent>
        {'This will remove you from the organization and all teams under it! '}
        <br />
        {'To undo it, you’ll have to ask another Billing Leader to re-add you.'}
        <StyledButton size='medium' onClick={handleClick} waiting={submitting}>
          <IconLabel icon='arrow_forward' iconAfter label='Leave the organization' />
        </StyledButton>
      </DialogContent>
    </StyledDialogContainer>
  )
}

export default LeaveOrgModal
