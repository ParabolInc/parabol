import {ArrowUpward} from '@mui/icons-material'
import {cn} from '../../ui/cn'
import {modEnter} from '../../utils/platform'
import PlainButton, {type PlainButtonProps} from '../PlainButton/PlainButton'

const SubmitReflectionButton = (props: Omit<PlainButtonProps, 'children'>) => {
  const {className, ...rest} = props
  return (
    <PlainButton
      tabIndex={0}
      aria-label='Submit reflection'
      title={`Submit reflection ${modEnter}`}
      className={cn(
        'flex h-6 w-6 shrink-0 items-center justify-center justify-self-end rounded-md bg-accent text-white hover:bg-sky-600 focus:bg-sky-600 disabled:cursor-not-allowed disabled:bg-surface-well disabled:text-fg-muted',
        className
      )}
      {...rest}
    >
      <ArrowUpward className='h-5 w-5' />
    </PlainButton>
  )
}

export default SubmitReflectionButton
