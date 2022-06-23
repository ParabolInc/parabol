import React, {forwardRef} from 'react'
import JiraSVG from './JiraSVG'
import MenuItem from './MenuItem'
import MenuItemAvatar from './MenuItemAvatar'
import MenuItemLabel from './MenuItemLabel'
import TypeAheadLabel from './TypeAheadLabel'

interface Props {
  name: string
  onClick: () => void
  query: string
}

const JiraMenuItem = forwardRef((props: Props, ref: any) => {
  const {name, onClick, query} = props
  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel>
          <MenuItemAvatar>
            <JiraSVG />
          </MenuItemAvatar>
          <TypeAheadLabel query={query} label={name} />
        </MenuItemLabel>
      }
      onClick={onClick}
    />
  )
})

export default JiraMenuItem
