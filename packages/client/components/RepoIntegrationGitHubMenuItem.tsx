import React, {forwardRef} from 'react'
import GitHubSVG from './GitHubSVG'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'
import RepoIntegrationMenuItemAvatar from './RepoIntegrationMenuItemAvatar'
import TypeAheadLabel from './TypeAheadLabel'

type TempRepo = {
  nameWithOwner: string
}
interface Props {
  repo: TempRepo
  onClick: () => void
  query: string
}

const RepoIntegrationGitHubMenuItem = forwardRef((props: Props, ref: any) => {
  const {query, onClick, repo} = props
  const {nameWithOwner} = repo
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
