import React, {forwardRef} from 'react'
import GitLabSVG from './GitLabSVG'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'
import RepoIntegrationMenuItemAvatar from './RepoIntegrationMenuItemAvatar'
import TypeAheadLabel from './TypeAheadLabel'

interface Props {
  fullPath: string
  onClick: (fullPath: string) => void
  query: string
}

const RepoIntegrationGitLabMenuItem = forwardRef((props: Props, ref: any) => {
  const {query, fullPath, onClick} = props

  const handleClick = () => {
    onClick(fullPath)
  }

  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel>
          <RepoIntegrationMenuItemAvatar>
            <GitLabSVG />
          </RepoIntegrationMenuItemAvatar>
          <TypeAheadLabel query={query} label={fullPath} />
        </MenuItemLabel>
      }
      onClick={handleClick}
    />
  )
})

export default RepoIntegrationGitLabMenuItem
