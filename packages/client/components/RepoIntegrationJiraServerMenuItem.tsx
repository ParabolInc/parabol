import graphql from 'babel-plugin-relay/macro'
import React, {forwardRef} from 'react'
import {useFragment} from 'react-relay'
import {RepoIntegrationJiraServerMenuItem_repoIntegration$key} from '../__generated__/RepoIntegrationJiraServerMenuItem_repoIntegration.graphql'
import JiraServerSVG from './JiraServerSVG'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'
import RepoIntegrationMenuItemAvatar from './RepoIntegrationMenuItemAvatar'
import TypeAheadLabel from './TypeAheadLabel'

interface Props {
  repoIntegration: RepoIntegrationJiraServerMenuItem_repoIntegration$key
  onClick: () => void
  query: string
}

const RepoIntegrationJiraServerMenuItem = forwardRef((props: Props, ref: any) => {
  const {repoIntegration: repoIntegrationKey, onClick, query} = props
  const repoIntegration = useFragment(graphql`
    fragment RepoIntegrationJiraServerMenuItem_repoIntegration on JiraServerRemoteProject {
      name
    }
  `,
  repoIntegrationKey)

  const {name} = repoIntegration
  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel>
          <RepoIntegrationMenuItemAvatar>
            <JiraServerSVG />
          </RepoIntegrationMenuItemAvatar>
          <TypeAheadLabel query={query} label={name} />
        </MenuItemLabel>
      }
      onClick={onClick}
    />
  )
})

export default RepoIntegrationJiraServerMenuItem
