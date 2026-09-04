import type {MouseEvent} from 'react'
import {MenuItem} from '../ui/Menu/MenuItem'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import IconButton from './IconButton'

export interface SearchQueries {
  id: string
  labelFirstLine: string
  labelSecondLine?: string
  onClick: () => void
  onDelete: () => void
}

interface Props {
  searchQueries: SearchQueries[]
}

const ScopingSearchHistoryMenu = (props: Props) => {
  const {searchQueries} = props

  return (
    <>
      {searchQueries.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>
          No saved queries yet!
        </EmptyDropdownMenuItemLabel>
      )}
      {searchQueries.map(({id, labelFirstLine, labelSecondLine, onClick, onDelete}) => {
        const handleDelete = (event: MouseEvent) => {
          event.stopPropagation()
          onDelete()
        }

        return (
          <MenuItem key={id} className='justify-center' onClick={onClick}>
            <div className='flex flex-1 flex-col items-start'>
              <span className='text-fg-secondary'>{labelFirstLine}</span>
              {labelSecondLine && <span className='text-fg-secondary'>{labelSecondLine}</span>}
            </div>
            <IconButton
              className='m-1'
              style={{transition: 'opacity .1s ease-in'}}
              aria-label={'Remove this search query'}
              icon='cancel'
              onClick={handleDelete}
              palette='midGray'
            />
          </MenuItem>
        )
      })}
    </>
  )
}

export default ScopingSearchHistoryMenu
