import graphql from 'babel-plugin-relay/macro'
import React, {forwardRef} from 'react'
import {useFragment} from 'react-relay'
import {JiraServerMenuItem_repoIntegration$key} from '../__generated__/JiraServerMenuItem_repoIntegration.graphql'
import JiraServerSVG from './JiraServerSVG'
import MenuItem from './MenuItem'
import MenuItemAvatar from './MenuItemAvatar'
import MenuItemLabel from './MenuItemLabel'
import TypeAheadLabel from './TypeAheadLabel'

interface Props {
  repoIntegration: JiraServerMenuItem_repoIntegration$key
  onClick: () => void
  query: string
}

const JiraServerMenuItem = forwardRef((props: Props, ref: any) => {
  const {repoIntegration: repoIntegrationKey, onClick, query} = props
  const repoIntegration = useFragment(
    graphql`
      fragment JiraServerMenuItem_repoIntegration on JiraServerRemoteProject {
        name
      }
    `,
    repoIntegrationKey
  )

  const {name} = repoIntegration
  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel>
          <MenuItemAvatar>
            <JiraServerSVG />
          </MenuItemAvatar>
          <TypeAheadLabel query={query} label={name} />
        </MenuItemLabel>
      }
      onClick={onClick}
    />
  )
})

export default JiraServerMenuItem
