import graphql from 'babel-plugin-relay/macro'
import React, {forwardRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {RepoIntegrationGitHubMenuItem_repoIntegration} from '../__generated__/RepoIntegrationGitHubMenuItem_repoIntegration.graphql'
import GitHubSVG from './GitHubSVG'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'
import RepoIntegrationMenuItemAvatar from './RepoIntegrationMenuItemAvatar'
import TypeAheadLabel from './TypeAheadLabel'

interface Props {
  repoIntegration: RepoIntegrationGitHubMenuItem_repoIntegration
  onClick: () => void
  query: string
}

const RepoIntegrationGitHubMenuItem = forwardRef((props: Props, ref: any) => {
  const {query, repoIntegration, onClick} = props
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

export default createFragmentContainer(RepoIntegrationGitHubMenuItem, {
  repoIntegration: graphql`
    fragment RepoIntegrationGitHubMenuItem_repoIntegration on _xGitHubRepository {
      nameWithOwner
    }
  `
})
