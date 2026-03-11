import {CallSplit} from '@mui/icons-material'
import {cn} from '../../ui/cn'
import type {PlainButtonProps} from '../PlainButton/PlainButton'
import ReflectionCardButton from './ReflectionCardButton'

type Props = {
  showUngroupButton?: boolean
  label?: string
} & PlainButtonProps

const UngroupButton = (props: Props) => {
  const {showUngroupButton, label = 'Ungroup all', ...rest} = props
  return (
    <ReflectionCardButton
      className={cn(
        'invisible absolute left-1 bottom-1 bg-white hover:bg-slate-200',
        showUngroupButton && 'visible'
      )}
      aria-label={label}
      title={label}
      {...rest}
    >
      <CallSplit className='h-5 w-5' />
    </ReflectionCardButton>
  )
}

export default UngroupButton
