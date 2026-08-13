import type {ReactNode} from 'react'
import Ellipsis from '../../../../components/Ellipsis/Ellipsis'

interface Props {
  children: ReactNode
}

const MeetingFacilitationHint = (props: Props) => {
  const {children} = props
  return (
    <div className='inline-block text-center text-[13px] text-fg-secondary leading-5'>
      {'('}
      {children}
      <Ellipsis />
      {')'}
    </div>
  )
}

export default MeetingFacilitationHint
