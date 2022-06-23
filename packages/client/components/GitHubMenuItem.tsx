import React, {forwardRef} from 'react'
import GitHubSVG from './GitHubSVG'
import MenuItem from './MenuItem'
import MenuItemAvatar from './MenuItemAvatar'
import MenuItemLabel from './MenuItemLabel'
import TypeAheadLabel from './TypeAheadLabel'

interface Props {
  nameWithOwner: string
  onClick: () => void
  query: string
}

const GitHubMenuItem = forwardRef((props: Props, ref: any) => {
  const {query, onClick, nameWithOwner} = props
  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel>
          <MenuItemAvatar>
            <GitHubSVG />
          </MenuItemAvatar>
          <TypeAheadLabel query={query} label={nameWithOwner} />
        </MenuItemLabel>
      }
      onClick={onClick}
    />
  )
})

export default GitHubMenuItem
