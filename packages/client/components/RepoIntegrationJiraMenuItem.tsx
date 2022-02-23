import graphql from 'babel-plugin-relay/macro'
import React, {forwardRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {RepoIntegrationJiraMenuItem_repoIntegration} from '../__generated__/RepoIntegrationJiraMenuItem_repoIntegration.graphql'
import JiraSVG from './JiraSVG'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'
import RepoIntegrationMenuItemAvatar from './RepoIntegrationMenuItemAvatar'
import TypeAheadLabel from './TypeAheadLabel'

interface Props {
  repoIntegration: RepoIntegrationJiraMenuItem_repoIntegration
  onClick: () => void
  query: string
}

const RepoIntegrationJiraMenuItem = forwardRef((props: Props, ref: any) => {
  const {repoIntegration, onClick, query} = props
  const {name} = repoIntegration
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

export default createFragmentContainer(RepoIntegrationJiraMenuItem, {
  repoIntegration: graphql`
    fragment RepoIntegrationJiraMenuItem_repoIntegration on JiraRemoteProject {
      name
    }
  `
})
