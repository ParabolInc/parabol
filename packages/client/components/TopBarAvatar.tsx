import graphql from 'babel-plugin-relay/macro'
import {MenuPosition} from 'hooks/useCoords'
import useMenu from 'hooks/useMenu'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import lazyPreload from 'utils/lazyPreload'
import {TopBarAvatar_viewer} from '__generated__/TopBarAvatar_viewer.graphql'
import defaultUserAvatar from '../styles/theme/images/avatar-user.svg'
import Avatar from './Avatar/Avatar'
import styled from '@emotion/styled'

const SpacedAvatar = styled(Avatar)({
  marginLeft: 8
})

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
      <SpacedAvatar
        onClick={togglePortal}
        onMouseEnter={StandardHubUserMenu.preload}
        ref={originRef}
        hasBadge={false}
        picture={userAvatar}
        size={40}
      />
      {menuPortal(<StandardHubUserMenu menuProps={menuProps} viewer={viewer} />)}
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
