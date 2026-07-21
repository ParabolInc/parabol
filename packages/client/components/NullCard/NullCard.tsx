import {cn} from '~/ui/cn'
import Ellipsis from '../Ellipsis/Ellipsis'

interface Props {
  className?: string
  preferredName: string
}

const NullCard = (props: Props) => {
  const {className, preferredName} = props
  return (
    <div
      className={cn(
        'flex w-full min-w-[256px] max-w-[300px] items-center justify-center rounded bg-surface-card p-4 shadow-card',
        className
      )}
      style={{minHeight: 120}}
    >
      <div className='w-full overflow-visible break-words text-center text-fg-secondary text-sm'>
        {preferredName}
        {' is adding a Task'}
        <Ellipsis />
      </div>
    </div>
  )
}

export default NullCard
