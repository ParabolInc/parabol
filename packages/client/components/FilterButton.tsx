import {forwardRef, type Ref} from 'react'
import {Button} from '~/ui/Button/Button'
import {FilterList} from '~/ui/icons'

interface Props {
  onClick: () => void
}

const FilterButton = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  const {onClick} = props
  return (
    <Button
      variant='flat'
      size='sm'
      className='ml-1 h-6 w-6 bg-sky-500 p-0 hover:bg-sky-500'
      onClick={onClick}
      ref={ref}
    >
      <FilterList className='h-[18px] w-[18px] text-white' />
    </Button>
  )
})

export default FilterButton
