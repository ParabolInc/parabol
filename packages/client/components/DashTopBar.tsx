import React from 'react'
import {PALETTE} from 'styles/paletteV2'
import styled from '@emotion/styled'
import PlainButton from './PlainButton/PlainButton'
import Icon from './Icon'
import {ICON_SIZE} from 'styles/typographyV2'
import parabolLogo from '../styles/theme/images/brand/logo.svg'
import {NavSidebar} from 'types/constEnums'
import TopBarSearch from './TopBarSearch'

interface Props {
  viewer: any
}

const Wrapper = styled('header')({
  backgroundColor: PALETTE.PRIMARY_MAIN,
  display: 'flex',
  height: 64
})

const LeftNavToggle = styled(PlainButton)({
  color: PALETTE.TEXT_LIGHT,
  fontSize: ICON_SIZE.MD24,
  paddingLeft: 16
})

const LeftNavHeader = styled('div')({
  display: 'flex',
  width: NavSidebar.WIDTH
})

const Img = styled('img')({
  padding: 16
})

const DashTopBar = (props: Props) => {
  const {viewer} = props
  return (
    <Wrapper>
      <LeftNavHeader>
        <LeftNavToggle>
          <Icon>{'menu'}</Icon>
        </LeftNavToggle>
        <Img crossOrigin='' src={parabolLogo} alt='' />
      </LeftNavHeader>
      <TopBarSearch />
    </Wrapper>
  )
}

export default DashTopBar
