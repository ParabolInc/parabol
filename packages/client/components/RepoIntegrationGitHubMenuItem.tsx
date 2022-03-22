import graphql from 'babel-plugin-relay/macro'
import React, {forwardRef} from 'react'
import {useFragment} from 'react-relay'
import {RepoIntegrationGitHubMenuItem_repoIntegration$key} from '../__generated__/RepoIntegrationGitHubMenuItem_repoIntegration.graphql'
import GitHubSVG from './GitHubSVG'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'
import RepoIntegrationMenuItemAvatar from './RepoIntegrationMenuItemAvatar'
import TypeAheadLabel from './TypeAheadLabel'

interface Props {
  repoIntegration: RepoIntegrationGitHubMenuItem_repoIntegration$key
  onClick: () => void
  query: string
}

const RepoIntegrationGitHubMenuItem = forwardRef((props: Props, ref: any) => {
  const {query, repoIntegration: repoIntegrationKey, onClick} = props
  const repoIntegration = useFragment(graphql`
    fragment RepoIntegrationGitHubMenuItem_repoIntegration on _xGitHubRepository {
      nameWithOwner
    }
  `, repoIntegrationKey)
  const {nameWithOwner} = repoIntegration
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
