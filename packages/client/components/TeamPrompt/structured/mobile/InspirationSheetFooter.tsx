import type {Ref} from 'react'
import {Button} from '../../../../ui/Button/Button'

interface Props {
  onBrowse: () => void
  onAddRemaining: () => void
  remainingCount: number
  adding: boolean
  browseRef?: Ref<HTMLButtonElement>
}

const InspirationSheetFooter = (props: Props) => {
  const {onBrowse, onAddRemaining, remainingCount, adding, browseRef} = props
  return (
    <div className='flex shrink-0 gap-3 border-hairline border-t px-4 pt-2.5 pb-7'>
      <Button
        ref={browseRef}
        variant='outline'
        size='lg'
        className='h-12 flex-1 px-3'
        onClick={onBrowse}
      >
        Browse work items
      </Button>
      {remainingCount > 0 && (
        <Button
          variant='secondary'
          size='lg'
          className='h-12 flex-1 px-3'
          disabled={adding}
          onClick={onAddRemaining}
        >
          {`Add remaining ${remainingCount}`}
        </Button>
      )}
    </div>
  )
}

export default InspirationSheetFooter
