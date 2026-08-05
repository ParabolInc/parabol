import {ArrowBack, ArrowDownward, ArrowForward, ArrowUpward} from '@mui/icons-material'
import type * as React from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import BaseTag from './Tag/BaseTag'

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
    <div className='m-0.75 flex animate-[drag-pulse_800ms_infinite] items-center justify-center [&_svg]:fill-white [&_svg]:stroke-2 [&_svg]:stroke-white [&_svg]:text-[11px]'>
      {
        {
          arrow_downward: <ArrowDownward />,
          arrow_upward: <ArrowUpward />,
          arrow_back: <ArrowBack />,
          arrow_forward: <ArrowForward />
        }[arrow!]
      }
    </div>
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
