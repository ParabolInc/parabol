import type * as React from 'react'
import {forwardRef} from 'react'
import {Search} from '~/ui/icons'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemLabel from './MenuItemLabel'
import MenuSearch from './MenuSearch'

interface Props {
  placeholder: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  value: string
}

export const SearchMenuItem = forwardRef((props: Props, ref: any) => {
  const {placeholder, onChange, value} = props
  return (
    <MenuItemLabel ref={ref} className='relative mx-2 mt-0 mb-2 overflow-visible p-0'>
      <MenuItemComponentAvatar className='pointer-events-none absolute top-1 left-2 m-0'>
        <Search className='h-[18px] w-[18px] text-fg-secondary' />
      </MenuItemComponentAvatar>
      <MenuSearch placeholder={placeholder} onChange={onChange} value={value} />
    </MenuItemLabel>
  )
})
