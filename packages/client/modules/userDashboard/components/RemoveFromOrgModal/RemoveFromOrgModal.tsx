import styled from '@emotion/styled'
import DialogContainer from '../../../../components/DialogContainer'
import DialogContent from '../../../../components/DialogContent'
import DialogTitle from '../../../../components/DialogTitle'
import IconLabel from '../../../../components/IconLabel'
import PrimaryButton from '../../../../components/PrimaryButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import useRouter from '../../../../hooks/useRouter'
import RemoveOrgUsersMutation from '../../../../mutations/RemoveOrgUsersMutation'

const StyledButton = styled(PrimaryButton)({
  margin: '1.5rem auto 0'
})

interface Props {
  orgId: string
  userId: string
  preferredName: string
  closePortal: () => void
}

const StyledDialogContainer = styled(DialogContainer)({
  width: '400'
})

const RemoveFromOrgModal = (props: Props) => {
  const {orgId, preferredName, userId, closePortal} = props
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const handleClick = () => {
    submitMutation()
    RemoveOrgUsersMutation(
      atmosphere,
      {orgId, userIds: [userId]},
      {
        history,
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
        {`This will remove ${preferredName} from all teams within the organization. Any outstanding tasks will be given to the respective team leads.`}
        <StyledButton size='medium' onClick={handleClick} waiting={submitting}>
          <IconLabel icon='arrow_forward' iconAfter label={`Remove ${preferredName}`} />
        </StyledButton>
      </DialogContent>
    </StyledDialogContainer>
  )
}

export default RemoveFromOrgModal
