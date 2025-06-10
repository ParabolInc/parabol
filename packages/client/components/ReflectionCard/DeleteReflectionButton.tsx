import {Cancel} from '@mui/icons-material'
import {cn} from '../../ui/cn'
import PlainButton, {PlainButtonProps} from '../PlainButton/PlainButton'

const DeleteReflectionButton = (props: PlainButtonProps) => {
  const {className, ...rest} = props
  const userLabel = 'Delete this reflection card'
  return (
    <PlainButton
      className={cn(
        'absolute top-[-9px] right-[-9px] size-4.5 rounded-full bg-[FFFFFF99] text-white',
        className
      )}
      aria-label={userLabel}
      title={userLabel}
      {...rest}
    >
      <div className='absolute -z-1 size-4.5 rounded-full bg-white' />
      <Cancel className='size-4.5 text-slate-600' />
    </PlainButton>
  )
}

export default DeleteReflectionButton
