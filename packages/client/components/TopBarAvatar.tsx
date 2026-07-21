import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TopBarAvatar_viewer$key} from '~/__generated__/TopBarAvatar_viewer.graphql'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import lazyPreload from '~/utils/lazyPreload'
import defaultUserAvatar from '../styles/theme/images/avatar-user.svg'
import Avatar from './Avatar/Avatar'

const StandardHubUserMenu = lazyPreload(
  () => import(/* webpackChunkName: 'StandardHubUserMenu' */ './StandardHubUserMenu')
)

interface Props {
  viewer: TopBarAvatar_viewer$key | null
}

const TopBarAvatar = (props: Props) => {
  const {viewer: viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment TopBarAvatar_viewer on User {
        picture
        ...StandardHubUserMenu_viewer
      }
    `,
    viewerRef
  )
  const userAvatar = viewer?.picture ?? defaultUserAvatar
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu<HTMLDivElement>(
    MenuPosition.UPPER_RIGHT
  )
  return (
    <button
      type='button'
      onClick={togglePortal}
      className='ml-2 rounded-full border-none bg-transparent p-1 focus-visible:cursor-pointer focus-visible:shadow-[0_0_0_2px_var(--color-sky-400)] focus-visible:outline-none active:shadow-[0_0_0_2px_transparent]'
    >
      <Avatar
        onMouseEnter={StandardHubUserMenu.preload}
        ref={originRef}
        picture={userAvatar}
        className='h-10 w-10 cursor-pointer'
      />
      {viewer && menuPortal(<StandardHubUserMenu menuProps={menuProps} viewerRef={viewer} />)}
    </button>
  )
}

export default TopBarAvatar
