import React from 'react'
import {PALETTE} from 'styles/paletteV2'
import styled from '@emotion/styled'
import PlainButton from './PlainButton/PlainButton'
import Icon from './Icon'
import {ICON_SIZE} from 'styles/typographyV2'
import parabolLogo from '../styles/theme/images/brand/logo.svg'
import {NavSidebar} from 'types/constEnums'
import TopBarSearch from './TopBarSearch'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import Avatar from './Avatar/Avatar'
import defaultUserAvatar from '../styles/theme/images/avatar-user.svg'

interface Props {
  toggle: () => void
  viewer: any
}

const Wrapper = styled('header')({
  backgroundColor: PALETTE.PRIMARY_MAIN,
  display: 'flex',
  height: 56
})

const LeftNavToggle = styled(PlainButton)({
  fontSize: ICON_SIZE.MD24,
  lineHeight: '16px',
  paddingLeft: 16
})

const LeftNavHeader = styled('div')({
  alignItems: 'center',
  color: PALETTE.TEXT_LIGHT,
  display: 'flex',
  width: NavSidebar.WIDTH
})

const TopBarIcons = styled('div')({
  alignItems: 'center',
  color: PALETTE.TEXT_LIGHT,
  display: 'flex',
  flex: 1,
  justifyContent: 'flex-end',
  maxWidth: 560,
  paddingRight: 16
})

const TopBarIcon = styled(Icon)({
  padding: '16px 8px'
})

const Title = styled('div')({
  paddingLeft: 16,
  fontSize: 24
})

const MobileDashTopBar = (props: Props) => {
  const {toggle, viewer} = props
  return (
    <Wrapper>
      <LeftNavHeader>
        <LeftNavToggle onClick={toggle}>
          <Icon>{'menu'}</Icon>
        </LeftNavToggle>
        <Title>Parabol</Title>
      </LeftNavHeader>
      <TopBarIcons>
        {/* Disable search in mobile for now */}
        {false && <TopBarIcon>{'search'}</TopBarIcon>}
        {false && <TopBarIcon>{'help_outline'}</TopBarIcon>}
        <TopBarIcon>{'notifications'}</TopBarIcon>
        <TopBarIcon>{'forum'}</TopBarIcon>
      </TopBarIcons>
    </Wrapper>
  )
}

export default createFragmentContainer(MobileDashTopBar, {
  viewer: graphql`
    fragment MobileDashTopBar_viewer on User {
      picture
    }
  `
})
