import {keyframes} from '@emotion/core'
import styled from '@emotion/styled'
import {ArrowBack, ArrowDownward, ArrowForward, ArrowUpward} from '@mui/icons-material'
import React from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import {PALETTE} from '../styles/paletteV3'
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
  color: PALETTE.TOMATO_600,
  fontSize: 11,
  position: 'absolute',
  right: 0,
  textAlign: 'end'
})

const ArrowIcon = styled('div')({
  animationDuration: '800ms',
  animationIterationCount: 'infinite',
  animationName: keyframesOpacity.toString(),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  //added little margin to separate from username
  margin: 3,
  '& svg': {
    strokeWidth: 2,
    stroke: 'white',
    fill: 'white',
    fontSize: 11
  }
})

const StyledTag = styled(BaseTag)({
  backgroundColor: PALETTE.GRAPE_500,
  display: 'flex',
  color: '#FFFFFF'
})

export type RemoteReflectionArrow =
  | 'arrow_downward'
  | 'arrow_upward'
  | 'arrow_back'
  | 'arrow_forward'

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
  const arrowEl = (
    <ArrowIcon>
      {
        {
          arrow_downward: <ArrowDownward />,
          arrow_upward: <ArrowUpward />,
          arrow_back: <ArrowBack />,
          arrow_forward: <ArrowForward />
        }[arrow!]
      }
    </ArrowIcon>
  )
  return (
    <Header style={style}>
      <StyledTag>
        {(arrow === 'arrow_downward' || arrow === 'arrow_upward') && arrowEl}
        {label}
        {arrow && arrowEl}
      </StyledTag>
    </Header>
  )
}

export default UserDraggingHeader
