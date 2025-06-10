import {Search} from '@mui/icons-material'
import {cn} from '../../ui/cn'
import {PlainButtonProps} from '../PlainButton/PlainButton'
import ReflectionCardButton from './ReflectionCardButton'

type Props = {
  showSpotlight?: boolean
} & PlainButtonProps

const SpotlightButton = (props: Props) => {
  const {showSpotlight, ...rest} = props
  return (
    <ReflectionCardButton
      className={cn(
        'invisible absolute right-1 bottom-1 bg-transparent hover:bg-slate-200',
        showSpotlight && 'visible'
      )}
      tooltipText='Find similar'
      {...rest}
    >
      <Search className='h-5 w-5' />
    </ReflectionCardButton>
  )
}

export default SpotlightButton
