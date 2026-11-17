import {Button} from '../../../ui/Button/Button'
import {addAllLabel} from './inspirationCopy'

interface Props {
  remaining: number
  total: number
  disabled: boolean
  onClick: () => void
}

const InspirationAddAllButton = (props: Props) => {
  const {remaining, total, disabled, onClick} = props
  if (total === 0) return null
  if (remaining === 0) {
    return (
      <div className='py-1.5 text-center text-fg-muted text-xs'>
        All drafted items are in your response — edit them like any text
      </div>
    )
  }
  if (total === 1) return null
  return (
    <Button variant='secondary' size='md' className='w-full' disabled={disabled} onClick={onClick}>
      {addAllLabel(remaining, total)}
    </Button>
  )
}

export default InspirationAddAllButton
