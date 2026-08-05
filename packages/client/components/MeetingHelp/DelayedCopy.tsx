import type {ReactNode} from 'react'
import {cn} from '../../ui/cn'
import Ellipsis from '../Ellipsis/Ellipsis'

interface Props {
  children: ReactNode
  show: number
  thresh: number
  margin?: string | number
}
const DelayedCopy = (props: Props) => {
  const {children, show, thresh, margin} = props
  const showEllipsis = show === thresh - 1
  return (
    <p className='m-0 mb-[1em]' style={margin !== undefined ? {margin} : undefined}>
      {showEllipsis && <Ellipsis />}
      <span
        className={cn(
          '[transition:all_500ms]',
          show >= thresh ? 'translate-y-0 opacity-100' : 'translate-y-[10px] opacity-0'
        )}
      >
        {children}
      </span>
    </p>
  )
}
export default DelayedCopy
