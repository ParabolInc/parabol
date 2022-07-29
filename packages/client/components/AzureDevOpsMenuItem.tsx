import React, {forwardRef} from 'react'
import AzureDevOpsSVG from './AzureDevOpsSVG'
import MenuItem from './MenuItem'
import MenuItemAvatar from './MenuItemAvatar'
import MenuItemLabel from './MenuItemLabel'
import TypeAheadLabel from './TypeAheadLabel'

interface Props {
  fullPath: string
  onClick: (fullPath: string) => void
  query: string
}

const AzureDevOpsMenuItem = forwardRef((props: Props, ref: any) => {
  const {query, fullPath, onClick} = props

  const handleClick = () => {
    onClick(fullPath)
  }

  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel>
          <MenuItemAvatar>
            <AzureDevOpsSVG />
          </MenuItemAvatar>
          <TypeAheadLabel query={query} label={fullPath} />
        </MenuItemLabel>
      }
      onClick={handleClick}
    />
  )
})

export default AzureDevOpsMenuItem
