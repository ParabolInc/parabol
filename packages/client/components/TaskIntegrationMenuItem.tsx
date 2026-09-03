import {forwardRef} from 'react'
import type {TaskServiceEnum} from '../__generated__/CreateTaskMutation.graphql'
import {MenuItem} from '../ui/Menu/MenuItem'
import AzureDevOpsSVG from './AzureDevOpsSVG'
import GitHubSVG from './GitHubSVG'
import GitLabSVG from './GitLabSVG'
import JiraServerSVG from './JiraServerSVG'
import JiraSVG from './JiraSVG'
import LinearSVG from './LinearSVG'
import MenuItemAvatar from './MenuItemAvatar'
import ParabolLogoSVG from './ParabolLogoSVG'
import TypeAheadLabel from './TypeAheadLabel'

interface Props {
  label: string
  onClick: () => void
  service: TaskServiceEnum
  query: string
}

export const integrationSvgLookup: Record<TaskServiceEnum, JSX.Element> = {
  jiraServer: <JiraServerSVG />,
  gitlab: <GitLabSVG />,
  azureDevOps: <AzureDevOpsSVG />,
  github: <GitHubSVG />,
  jira: <JiraSVG />,
  PARABOL: <ParabolLogoSVG />,
  linear: <LinearSVG />
}

const TaskIntegrationMenuItem = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const {label, onClick, service, query} = props
  return (
    <MenuItem ref={ref} onClick={onClick}>
      <MenuItemAvatar>{integrationSvgLookup[service]}</MenuItemAvatar>
      <TypeAheadLabel query={query} label={label} />
    </MenuItem>
  )
})

export default TaskIntegrationMenuItem
