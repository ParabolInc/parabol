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
  userId?: string
  userIds?: string[]
  preferredName?: string
  closePortal: () => void
  onSuccess?: () => void
}

const StyledDialogContainer = styled(DialogContainer)({
  width: '400px'
})

const RemoveFromOrgModal = (props: Props) => {
  const {orgId, preferredName, userId, userIds, closePortal, onSuccess} = props
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()

  // Determine if we're in single or bulk mode
  const isSingleUser = !!userId && !!preferredName
  const actualUserIds = isSingleUser ? [userId!] : userIds || []
  const count = actualUserIds.length

  const handleClick = () => {
    submitMutation()
    RemoveOrgUsersMutation(
      atmosphere,
      {orgId, userIds: actualUserIds},
      {
        history,
        onError,
        onCompleted: () => {
          onCompleted()
          closePortal()
          onSuccess?.()
        }
      }
    )
  }

  return (
    <StyledDialogContainer>
      <DialogTitle>{'Are you sure?'}</DialogTitle>
      <DialogContent>
        {isSingleUser
          ? `This will remove ${preferredName} from all teams within the organization. Any outstanding tasks will be given to the respective team leads.`
          : `This will remove ${count} member${count === 1 ? '' : 's'} from all teams within the organization. Any outstanding tasks will be given to the respective team leads.`}
        <StyledButton size='medium' onClick={handleClick} waiting={submitting}>
          <IconLabel
            icon='arrow_forward'
            iconAfter
            label={
              isSingleUser
                ? `Remove ${preferredName}`
                : `Remove ${count} member${count === 1 ? '' : 's'}`
            }
          />
        </StyledButton>
      </DialogContent>
    </StyledDialogContainer>
  )
}

export default RemoveFromOrgModal
