import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import type {TopBarAvatar_viewer$key} from '~/__generated__/TopBarAvatar_viewer.graphql'
import lazyPreload from '~/utils/lazyPreload'
import defaultUserAvatar from '../styles/theme/images/avatar-user.svg'
import {Menu} from '../ui/Menu/Menu'
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
  return (
    <Menu
      trigger={
        <button
          type='button'
          onMouseEnter={StandardHubUserMenu.preload}
          className='ml-2 rounded-full border-none bg-transparent p-1 focus-visible:cursor-pointer focus-visible:shadow-[0_0_0_2px_var(--color-sky-400)] focus-visible:outline-none active:shadow-[0_0_0_2px_transparent]'
        >
          <Avatar picture={userAvatar} className='h-10 w-10 cursor-pointer' />
        </button>
      }
    >
      {viewer && (
        <Suspense fallback={null}>
          <StandardHubUserMenu viewerRef={viewer} />
        </Suspense>
      )}
    </Menu>
  )
}

export default TopBarAvatar
