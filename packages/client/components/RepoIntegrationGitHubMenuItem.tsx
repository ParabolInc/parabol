import React, {forwardRef} from 'react'
import GitHubSVG from './GitHubSVG'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'
import RepoIntegrationMenuItemAvatar from './RepoIntegrationMenuItemAvatar'
import TypeAheadLabel from './TypeAheadLabel'

interface Props {
  nameWithOwner: string
  onClick: () => void
  query: string
}

const RepoIntegrationGitHubMenuItem = forwardRef((props: Props, ref: any) => {
  const {query, onClick, nameWithOwner} = props
  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel>
          <RepoIntegrationMenuItemAvatar>
            <GitHubSVG />
          </RepoIntegrationMenuItemAvatar>
          <TypeAheadLabel query={query} label={nameWithOwner} />
        </MenuItemLabel>
      }
      onClick={onClick}
    />
  )
})

export default RepoIntegrationGitHubMenuItem
