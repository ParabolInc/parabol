import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {RemoveFromOrgModal_organizationUsers$key} from '../../../../__generated__/RemoveFromOrgModal_organizationUsers.graphql'
import IconLabel from '../../../../components/IconLabel'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import RemoveOrgUsersMutation from '../../../../mutations/RemoveOrgUsersMutation'
import {Button} from '../../../../ui/Button/Button'
import {Dialog} from '../../../../ui/Dialog/Dialog'
import {DialogActions} from '../../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'
import plural from '../../../../utils/plural'
import getMutationError from '../../../../utils/relay/getMutationError'

interface Props {
  isOpen: boolean
  orgId: string
  userIds: string[]
  organizationUsers: RemoveFromOrgModal_organizationUsers$key
  closePortal: () => void
  onSuccess?: () => void
}

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
  const {isOpen, orgId, userIds, organizationUsers, closePortal, onSuccess} = props
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const {onCompleted, onError, submitMutation, submitting, error} = useMutationProps({
    errorDisplay: 'inline'
  })
  const {viewerId} = atmosphere

  const users = useFragment(organizationUsersFragment, organizationUsers)

  const usersWithRemovalStatus = users.map((organizationUser) => {
    const isSelf = organizationUser.user.id === viewerId
    const isBillingLeader = organizationUser.role === 'BILLING_LEADER'
    const isOrgAdmin = organizationUser.role === 'ORG_ADMIN'
    let reason = ''
    if (isSelf) reason = 'Yourself'
    else if (isOrgAdmin) reason = 'Organization Admin'
    else if (isBillingLeader) reason = 'Billing Leader'
    return {user: organizationUser.user, reason, isRemovable: !reason}
  })

  const nonRemovableUsers = usersWithRemovalStatus.filter((u) => !u.isRemovable)
  const removableUserIds = usersWithRemovalStatus.filter((u) => u.isRemovable).map((u) => u.user.id)
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
        navigate,
        onError,
        onCompleted: (res, errors) => {
          onCompleted(res, errors)
          if (getMutationError(res, errors)) return
          closePortal()
          onSuccess?.()
        }
      }
    )
  }

  return (
    <Dialog isOpen={isOpen} onClose={closePortal}>
      <DialogContent>
        <DialogTitle>Are you sure?</DialogTitle>
        {removableCount > 0 && (
          <p>{`This will remove ${removableCount} ${plural(removableCount, 'member')} from all teams within the organization. Any outstanding tasks will be given to the respective team leads.`}</p>
        )}
        {skippedCount > 0 && (
          <div className='mt-4'>
            <div className='mb-2 font-medium text-fg-primary text-sm'>
              {`The following ${plural(skippedCount, 'user')} will not be removed:`}
            </div>
            <div className='max-h-60 overflow-auto rounded border border-hairline-strong'>
              <div className='flex items-center justify-between border-hairline-strong border-b bg-surface-raised px-3 py-2 font-semibold text-sm'>
                <div>Name</div>
                <div>Reason</div>
              </div>
              {nonRemovableUsers.map((item) => (
                <div
                  key={item.user.id}
                  className='flex items-center justify-between border-hairline-strong border-b px-3 py-2 last:border-0'
                >
                  <div className='font-medium'>{item.user.preferredName}</div>
                  <div className='text-fg-secondary text-sm'>{item.reason}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {error && <div className='mt-4 font-semibold text-fg-error text-sm'>{error.message}</div>}
        <DialogActions>
          {removableCount > 0 ? (
            <>
              <Button variant='outline' size='md' onClick={closePortal}>
                Cancel
              </Button>
              <Button variant='primary' size='md' onClick={handleClick} disabled={submitting}>
                <IconLabel
                  icon='arrow_forward'
                  iconAfter
                  label={`Remove ${removableCount} ${plural(removableCount, 'member')}`}
                />
              </Button>
            </>
          ) : (
            <Button variant='primary' size='md' onClick={closePortal}>
              <IconLabel icon='close' label='Close' />
            </Button>
          )}
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default RemoveFromOrgModal
