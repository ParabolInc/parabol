import {type ComponentPropsWithoutRef, forwardRef} from 'react'
import {Button} from '~/ui/Button/Button'
import {FilterList} from '~/ui/icons'

const FilterButton = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<'button'>>(
  (props, ref) => {
    return (
      <Button
        variant='flat'
        size='sm'
        className='ml-1 h-6 w-6 bg-sky-500 p-0 hover:bg-sky-500'
        ref={ref}
        {...props}
      >
        <FilterList className='h-[18px] w-[18px] text-white' />
      </Button>
    )
  }
)

export default FilterButton
