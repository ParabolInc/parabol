import React from 'react'
import styled from '@emotion/styled'
import useAtmosphere from '../hooks/useAtmosphere'
import {PALETTE} from '../styles/paletteV2'
import Icon from './Icon'
import {keyframes} from '@emotion/core'
import BaseTag from './Tag/BaseTag'


const keyframesOpacity = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.33;
  }
}`

const Header = styled('div')({
  bottom: '100%',
  color: PALETTE.TEXT_RED,
  fontSize: 11,
  lineHeight: '18px',
  position: 'absolute',
  right: 0,
  textAlign: 'end'
})

const Arrow = styled(Icon)({
  animationDuration: '800ms',
  animationIterationCount: 'infinite',
  animationName: keyframesOpacity.toString(),
  height: 11,
  width: 11,
  fontSize: 11,
  fontWeight: 600,
  verticalAlign: 'text-bottom'
})

const Tag = styled(BaseTag)({
  backgroundColor: PALETTE.PRIMARY_LIGHT,
  color: '#FFFFFF'
})

export type RemoteReflectionArrow = 'arrow_downward' | 'arrow_upward' | 'arrow_back' | 'arrow_forward'

interface Props {
  arrow?: RemoteReflectionArrow
  userId: string
  name: string
  style?: React.CSSProperties
}

const UserDraggingHeader = (props: Props) => {
  const {arrow, userId, name, style} = props
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const label = userId === viewerId ? 'Your ghost 👻' : name
  const arrowEl = <Arrow>{arrow}</Arrow>
  return (
    <Header style={style}>
      <Tag>
        {(arrow === 'arrow_downward' || arrow === 'arrow_upward') && arrowEl}
        {label}
        {arrow && arrowEl}
      </Tag>
    </Header>
  )
}

export default UserDraggingHeader
