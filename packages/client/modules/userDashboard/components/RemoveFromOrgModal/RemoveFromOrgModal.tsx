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

  // Filter out non-removable users
  const removableUserIds = users
    .filter((organizationUser) => {
      const isSelf = organizationUser.user.id === viewerId
      const isBillingLeader = organizationUser.role === 'BILLING_LEADER'
      const isOrgAdmin = organizationUser.role === 'ORG_ADMIN'
      return !isSelf && !isBillingLeader && !isOrgAdmin
    })
    .map((organizationUser) => organizationUser.user.id)

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
          <div className='mt-2 text-sm text-slate-600'>
            {`Note: ${skippedCount} ${plural(skippedCount, 'user')} ${skippedCount === 1 ? 'has' : 'have'} been skipped because ${skippedCount === 1 ? 'they are' : 'they are either'} yourself, an organization admin, or a billing leader.`}
          </div>
        )}
        {removableCount > 0 && (
          <StyledButton size='medium' onClick={handleClick} waiting={submitting}>
            <IconLabel
              icon='arrow_forward'
              iconAfter
              label={`Remove ${removableCount} ${plural(removableCount, 'member')}`}
            />
          </StyledButton>
        )}
        {removableCount === 0 && (
          <div>
            <div className='mt-2 text-sm text-slate-600'>
              None of the selected users can be removed as they are either yourself, organization
              admins, or billing leaders.
            </div>
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
