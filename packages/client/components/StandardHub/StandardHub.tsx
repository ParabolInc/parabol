import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import useRouter from '~/hooks/useRouter'
import {StandardHub_viewer$key} from '../../__generated__/StandardHub_viewer.graphql'
import {PALETTE} from '../../styles/paletteV3'
import defaultUserAvatar from '../../styles/theme/images/avatar-user.svg'
import Avatar from '../Avatar/Avatar'

const StandardHubRoot = styled('div')({
  backgroundColor: PALETTE.GRAPE_700,
  display: 'flex',
  flexDirection: 'column',
  padding: 8,
  width: '100%'
})

const User = styled('div')({
  display: 'flex',
  cursor: 'pointer',
  flex: 1,
  position: 'relative'
})

const NameAndEmail = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  paddingLeft: 16
})

const PreferredName = styled('div')({
  color: PALETTE.SLATE_200,
  fontSize: 16,
  lineHeight: '24px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
})

const Email = styled('div')({
  fontSize: 12,
  lineHeight: '16px'
})

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
  const {history} = useRouter()

  const gotoUserSettings = () => {
    history.push('/me/profile')
    handleMenuClick()
  }
  return (
    <StandardHubRoot>
      <User onClick={gotoUserSettings}>
        <Avatar picture={userAvatar} className='h-10 w-10' />
        <NameAndEmail>
          <PreferredName>{preferredName}</PreferredName>
          <Email>{email}</Email>
        </NameAndEmail>
      </User>
    </StandardHubRoot>
  )
}

export default StandardHub
