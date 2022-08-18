import React, {forwardRef} from 'react'
import {TaskServiceEnum} from '~/../server/database/types/Task'
import AzureDevOpsSVG from './AzureDevOpsSVG'
import GitHubSVG from './GitHubSVG'
import GitLabSVG from './GitLabSVG'
import JiraServerSVG from './JiraServerSVG'
import JiraSVG from './JiraSVG'
import MenuItem from './MenuItem'
import MenuItemAvatar from './MenuItemAvatar'
import MenuItemLabel from './MenuItemLabel'
import ParabolLogoSVG from './ParabolLogoSVG'
import TypeAheadLabel from './TypeAheadLabel'

interface Props {
  label: string
  onClick: () => void
  service: TaskServiceEnum
  query: string
}

const svgLookup: Record<TaskServiceEnum, React.MemoExoticComponent<() => JSX.Element>> = {
  jiraServer: JiraServerSVG,
  gitlab: GitLabSVG,
  azureDevOps: AzureDevOpsSVG,
  github: GitHubSVG,
  jira: JiraSVG,
  PARABOL: ParabolLogoSVG
}

const TaskIntegrationMenuItem = forwardRef((props: Props, ref: any) => {
  const {label, onClick, service, query} = props
  const Svg = svgLookup[service]
  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel>
          <MenuItemAvatar>
            <Svg />
          </MenuItemAvatar>
          <TypeAheadLabel query={query} label={label} />
        </MenuItemLabel>
      }
      onClick={onClick}
    />
  )
})

export default TaskIntegrationMenuItem
