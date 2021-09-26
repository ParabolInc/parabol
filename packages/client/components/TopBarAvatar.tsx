import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import lazyPreload from '~/utils/lazyPreload'
import {TopBarAvatar_viewer} from '~/__generated__/TopBarAvatar_viewer.graphql'
import defaultUserAvatar from '../styles/theme/images/avatar-user.svg'
import Avatar from './Avatar/Avatar'

const AvatarWrapper = styled('button') ({
  background: 'transparent',
  border: 'none',
  borderRadius: 100,
  marginLeft: 8,
  padding: 4,
  ':focus': {
    boxShadow: '0 0 0 2px #61B1EB',
    cursor: 'pointer',
    outline: 'none'
  }
})

const SpacedAvatar = styled(Avatar)({})

const StandardHubUserMenu = lazyPreload(() =>
  import(/* webpackChunkName: 'StandardHubUserMenu' */ './StandardHubUserMenu')
)

interface Props {
  viewer: TopBarAvatar_viewer | null
}

const TopBarAvatar = (props: Props) => {
  const {viewer} = props
  const userAvatar = viewer?.picture ?? defaultUserAvatar
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu<HTMLDivElement>(
    MenuPosition.UPPER_RIGHT
  )
  return (
    <>
    <AvatarWrapper onClick={togglePortal}>
      <SpacedAvatar
        onMouseEnter={StandardHubUserMenu.preload}
        ref={originRef}
        hasBadge={false}
        picture={userAvatar}
        size={40}
      />
      {menuPortal(<StandardHubUserMenu menuProps={menuProps} viewer={viewer} />)}
    </AvatarWrapper>
    </>
  )
}

export default createFragmentContainer(TopBarAvatar, {
  viewer: graphql`
    fragment TopBarAvatar_viewer on User {
      picture
      ...StandardHubUserMenu_viewer
    }
  `
})
