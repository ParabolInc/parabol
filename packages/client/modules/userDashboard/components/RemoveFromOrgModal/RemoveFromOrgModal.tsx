import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {RemoveFromOrgModal_organizationUsers$key} from '../../../../__generated__/RemoveFromOrgModal_organizationUsers.graphql'
import DialogContainer from '../../../../components/DialogContainer'
import DialogContent from '../../../../components/DialogContent'
import DialogTitle from '../../../../components/DialogTitle'
import IconLabel from '../../../../components/IconLabel'
import PrimaryButton from '../../../../components/PrimaryButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import useRouter from '../../../../hooks/useRouter'
import RemoveOrgUsersMutation from '../../../../mutations/RemoveOrgUsersMutation'
import plural from '../../../../utils/plural'

const StyledButton = styled(PrimaryButton)({
  margin: '1.5rem auto 0'
})

interface Props {
  orgId: string
  userIds: string[]
  organizationUsers: RemoveFromOrgModal_organizationUsers$key
  closePortal: () => void
  onSuccess?: () => void
}

const StyledDialogContainer = styled(DialogContainer)({
  width: '400px'
})

// Fragment for organization users that can be potentially removed
const organizationUsersFragment = graphql`
  fragment RemoveFromOrgModal_organizationUsers on OrganizationUser @relay(plural: true) {
    role
    user {
      id
      preferredName
    }
  }
`

const RemoveFromOrgModal = (props: Props) => {
  const {orgId, userIds, organizationUsers, closePortal, onSuccess} = props
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const {viewerId} = atmosphere

  const users = useFragment(organizationUsersFragment, organizationUsers)

  // Map users with their removal status and reason
  const usersWithRemovalStatus = users.map((organizationUser) => {
    const isSelf = organizationUser.user.id === viewerId
    const isBillingLeader = organizationUser.role === 'BILLING_LEADER'
    const isOrgAdmin = organizationUser.role === 'ORG_ADMIN'

    let reason = ''
    if (isSelf) reason = 'Yourself'
    else if (isOrgAdmin) reason = 'Organization Admin'
    else if (isBillingLeader) reason = 'Billing Leader'

    return {
      user: organizationUser.user,
      reason,
      isRemovable: !reason
    }
  })

  // Filter out non-removable users
  const nonRemovableUsers = usersWithRemovalStatus.filter((user) => !user.isRemovable)

  // Get removable user IDs
  const removableUserIds = usersWithRemovalStatus
    .filter((user) => user.isRemovable)
    .map((user) => user.user.id)

  const skippedCount = userIds.length - removableUserIds.length
  const removableCount = removableUserIds.length

  const handleClick = () => {
    if (removableUserIds.length === 0) {
      closePortal()
      return
    }
    submitMutation()
    RemoveOrgUsersMutation(
      atmosphere,
      {orgId, userIds: removableUserIds},
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
        {removableCount > 0 && (
          <div>
            {`This will remove ${removableCount} ${plural(removableCount, 'member')} from all teams within the organization. Any outstanding tasks will be given to the respective team leads.`}
          </div>
        )}

        {skippedCount > 0 && (
          <div className='mt-4'>
            <div className='mb-2 text-sm font-medium text-slate-700'>
              {`The following ${plural(skippedCount, 'user')} will not be removed:`}
            </div>
            <div className='max-h-60 overflow-auto rounded border border-slate-600'>
              <div className='flex items-center justify-between border-b border-slate-400 bg-slate-100 px-3 py-2 text-sm font-semibold'>
                <div>Name</div>
                <div>Reason</div>
              </div>
              {nonRemovableUsers.map((item) => (
                <div
                  key={item.user.id}
                  className='flex items-center justify-between border-b border-slate-400 px-3 py-2 last:border-0'
                >
                  <div className='font-medium'>{item.user.preferredName}</div>
                  <div className='text-sm text-slate-600'>{item.reason}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {removableCount > 0 ? (
          <StyledButton size='medium' onClick={handleClick} waiting={submitting}>
            <IconLabel
              icon='arrow_forward'
              iconAfter
              label={`Remove ${removableCount} ${plural(removableCount, 'member')}`}
            />
          </StyledButton>
        ) : (
          <div className='mt-4'>
            <StyledButton size='medium' onClick={closePortal}>
              <IconLabel icon='close' label='Close' />
            </StyledButton>
          </div>
        )}
      </DialogContent>
    </StyledDialogContainer>
  )
}

export default RemoveFromOrgModal
