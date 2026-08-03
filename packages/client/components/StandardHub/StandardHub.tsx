import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {StandardHub_viewer$key} from '../../__generated__/StandardHub_viewer.graphql'
import defaultUserAvatar from '../../styles/theme/images/avatar-user.svg'
import Avatar from '../Avatar/Avatar'

interface Props {
  handleMenuClick: () => void
  viewer: StandardHub_viewer$key | null
}

const DEFAULT_VIEWER = {
  picture: '',
  preferredName: '',
  email: '',
  tier: 'starter',
  billingTier: 'starter'
} as const

const StandardHub = (props: Props) => {
  const {handleMenuClick, viewer: viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment StandardHub_viewer on User {
        email
        picture
        preferredName
      }
    `,
    viewerRef
  )
  const {email, picture, preferredName} = viewer || DEFAULT_VIEWER
  const userAvatar = picture || defaultUserAvatar
  const navigate = useNavigate()

  const gotoUserSettings = () => {
    navigate('/me/profile')
    handleMenuClick()
  }
  return (
    <div className='flex w-full flex-col bg-surface-topbar p-2'>
      <div className='relative flex flex-1 cursor-pointer' onClick={gotoUserSettings}>
        <Avatar picture={userAvatar} className='h-10 w-10' />
        <div className='flex flex-col overflow-hidden pl-4'>
          <div className='overflow-hidden text-ellipsis whitespace-nowrap text-base text-fg-topbar leading-6'>
            {preferredName}
          </div>
          <div className='text-xs leading-4'>{email}</div>
        </div>
      </div>
    </div>
  )
}

export default StandardHub
