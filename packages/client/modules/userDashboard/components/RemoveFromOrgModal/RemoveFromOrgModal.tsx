import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {RemoveFromOrgModal_organizationUsers$key} from '../../../../__generated__/RemoveFromOrgModal_organizationUsers.graphql'
import IconLabel from '../../../../components/IconLabel'
import PrimaryButton from '../../../../components/PrimaryButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import RemoveOrgUsersMutation from '../../../../mutations/RemoveOrgUsersMutation'
import {Dialog} from '../../../../ui/Dialog/Dialog'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'
import plural from '../../../../utils/plural'

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
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
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
        onCompleted: () => {
          onCompleted()
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
            <div className='mb-2 font-medium text-slate-700 text-sm'>
              {`The following ${plural(skippedCount, 'user')} will not be removed:`}
            </div>
            <div className='max-h-60 overflow-auto rounded border border-slate-600'>
              <div className='flex items-center justify-between border-slate-400 border-b bg-slate-100 px-3 py-2 font-semibold text-sm'>
                <div>Name</div>
                <div>Reason</div>
              </div>
              {nonRemovableUsers.map((item) => (
                <div
                  key={item.user.id}
                  className='flex items-center justify-between border-slate-400 border-b px-3 py-2 last:border-0'
                >
                  <div className='font-medium'>{item.user.preferredName}</div>
                  <div className='text-slate-600 text-sm'>{item.reason}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {removableCount > 0 ? (
          <PrimaryButton
            size='medium'
            className='mx-auto mt-6 mb-0'
            onClick={handleClick}
            waiting={submitting}
          >
            <IconLabel
              icon='arrow_forward'
              iconAfter
              label={`Remove ${removableCount} ${plural(removableCount, 'member')}`}
            />
          </PrimaryButton>
        ) : (
          <div className='mt-4'>
            <PrimaryButton size='medium' className='mx-auto mb-0' onClick={closePortal}>
              <IconLabel icon='close' label='Close' />
            </PrimaryButton>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default RemoveFromOrgModal
