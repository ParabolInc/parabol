import {cn} from '../../ui/cn'

interface Props {
  isConnected: boolean
}

const AvatarBadge = (props: Props) => {
  const {isConnected} = props
  const connection = isConnected ? 'Online' : 'Offline'
  return (
    <div className='relative block h-[10px] w-[10px]'>
      <div
        className={cn(
          'h-[10px] w-[10px] rounded-[10px] border border-[rgba(255,255,255,.65)]',
          isConnected ? 'bg-jade-400' : 'bg-slate-600'
        )}
      />
      <div className='sr-only'>{connection}</div>
    </div>
  )
}

export default AvatarBadge
