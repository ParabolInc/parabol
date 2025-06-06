import {Search} from '@mui/icons-material'
import {PlainButtonProps} from '../PlainButton/PlainButton'
import ReflectionCardButton from './ReflectionCardButton'

const SpotlightButton = (props: PlainButtonProps) => {
  return (
    <ReflectionCardButton tooltipText='Find similar' {...props}>
      <Search className='h-5 w-5' />
    </ReflectionCardButton>
  )
}

export default SpotlightButton
