import {keyframes} from '@emotion/react'
import styled from '@emotion/styled'
import {ArrowBack, ArrowDownward, ArrowForward, ArrowUpward} from '@mui/icons-material'
import type * as React from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import BaseTag from './Tag/BaseTag'

const keyframesOpacity = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.33;
  }
}`

const AnimatedIcon = styled('div')({
  animationDuration: '800ms',
  animationIterationCount: 'infinite',
  animationName: keyframesOpacity.toString()
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
    <AnimatedIcon className='m-0.75 flex items-center justify-center [&_svg]:fill-white [&_svg]:stroke-2 [&_svg]:stroke-white [&_svg]:text-[11px]'>
      {
        {
          arrow_downward: <ArrowDownward />,
          arrow_upward: <ArrowUpward />,
          arrow_back: <ArrowBack />,
          arrow_forward: <ArrowForward />
        }[arrow!]
      }
    </AnimatedIcon>
  )
  return (
    <div
      className='absolute right-0 bottom-full text-end text-[11px] text-tomato-600'
      style={style}
    >
      <BaseTag className='flex bg-grape-500 text-white'>
        {(arrow === 'arrow_downward' || arrow === 'arrow_upward') && arrowEl}
        {label}
        {arrow && arrowEl}
      </BaseTag>
    </div>
  )
}

export default UserDraggingHeader
