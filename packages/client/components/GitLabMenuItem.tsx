import React, {forwardRef} from 'react'
import GitLabSVG from './GitLabSVG'
import MenuItem from './MenuItem'
import MenuItemAvatar from './MenuItemAvatar'
import MenuItemLabel from './MenuItemLabel'
import TypeAheadLabel from './TypeAheadLabel'

interface Props {
  fullPath: string
  onClick: (fullPath: string) => void
  query: string
}

const GitLabMenuItem = forwardRef((props: Props, ref: any) => {
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
            <GitLabSVG />
          </MenuItemAvatar>
          <TypeAheadLabel query={query} label={fullPath} />
        </MenuItemLabel>
      }
      onClick={handleClick}
    />
  )
})

export default GitLabMenuItem
