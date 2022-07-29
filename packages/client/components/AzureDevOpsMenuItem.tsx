import React, {forwardRef} from 'react'
import AzureDevOpsSVG from './AzureDevOpsSVG'
import MenuItem from './MenuItem'
import MenuItemAvatar from './MenuItemAvatar'
import MenuItemLabel from './MenuItemLabel'
import TypeAheadLabel from './TypeAheadLabel'

interface Props {
  name: string
  onClick: (name: string) => void
  query: string
}

const AzureDevOpsMenuItem = forwardRef((props: Props, ref: any) => {
  const {query, name, onClick} = props

  const handleClick = () => {
    onClick(name)
  }

  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel>
          <MenuItemAvatar>
            <AzureDevOpsSVG />
          </MenuItemAvatar>
          <TypeAheadLabel query={query} label={name} />
        </MenuItemLabel>
      }
      onClick={handleClick}
    />
  )
})

export default AzureDevOpsMenuItem
