import graphql from 'babel-plugin-relay/macro'
import React, {forwardRef} from 'react'
import {useFragment} from 'react-relay'
import {RepoIntegrationJiraMenuItem_repoIntegration$key} from '../__generated__/RepoIntegrationJiraMenuItem_repoIntegration.graphql'
import JiraSVG from './JiraSVG'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'
import RepoIntegrationMenuItemAvatar from './RepoIntegrationMenuItemAvatar'
import TypeAheadLabel from './TypeAheadLabel'

interface Props {
  repoIntegration: RepoIntegrationJiraMenuItem_repoIntegration$key
  onClick: () => void
  query: string
}

const RepoIntegrationJiraMenuItem = forwardRef((props: Props, ref: any) => {
  const {repoIntegration: repoIntegrationKey, onClick, query} = props
  const repoIntegration = useFragment(graphql`
    fragment RepoIntegrationJiraMenuItem_repoIntegration on JiraRemoteProject {
      name
    }
  `, repoIntegrationKey)
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

export default RepoIntegrationJiraMenuItem
