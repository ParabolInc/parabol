import {Button} from '../../../../ui/Button/Button'

interface Props {
  onAddRemaining: () => void
  remainingCount: number
  adding: boolean
}

const InspirationSheetFooter = (props: Props) => {
  const {onAddRemaining, remainingCount, adding} = props
  return (
    <div className='flex shrink-0 border-hairline border-t px-4 pt-2.5 pb-7'>
      <Button
        variant='secondary'
        size='lg'
        className='h-12 flex-1 px-3'
        disabled={adding}
        onClick={onAddRemaining}
      >
        {`Add remaining ${remainingCount}`}
      </Button>
    </div>
  )
}

export default InspirationSheetFooter
