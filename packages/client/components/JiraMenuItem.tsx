import React, {forwardRef} from 'react'
import JiraSVG from './JiraSVG'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'
import RepoIntegrationMenuItemAvatar from './RepoIntegrationMenuItemAvatar'
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
          <RepoIntegrationMenuItemAvatar>
            <JiraSVG />
          </RepoIntegrationMenuItemAvatar>
          <TypeAheadLabel query={query} label={name} />
        </MenuItemLabel>
      }
      onClick={onClick}
    />
  )
})

export default JiraMenuItem
