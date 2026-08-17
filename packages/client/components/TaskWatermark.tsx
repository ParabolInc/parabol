import type React from 'react'
import {cn} from '../ui/cn'
import AzureDevOpsSVG from './AzureDevOpsSVG'
import GitHubSVG from './GitHubSVG'
import GitLabSVG from './GitLabSVG'
import JiraServerSVG from './JiraServerSVG'
import JiraSVG from './JiraSVG'
import LinearSVG from './LinearSVG'

// We need to update the SVG components to accept size props or create wrapper components
// For this implementation, we'll create a wrapper that ensures 120x120 sizing

interface WatermarkSVGProps {
  Icon: React.ComponentType
  className?: string
}

const WatermarkSVG = ({Icon, className}: WatermarkSVGProps) => (
  <div className={cn('absolute right-[24px] bottom-[8px] scale-500 transform', className)}>
    <Icon />
  </div>
)

// GitHub and Linear logos are near-black, so they need the white variant in dark mode.
// The other services' logos are colored and stay legible on dark surfaces.
const iconLookup: {
  [service: string]: {Icon: React.ComponentType; className?: string} | undefined
} = {
  github: {Icon: GitHubSVG, className: 'dark:[&_path]:fill-white'},
  jira: {Icon: JiraSVG},
  jiraServer: {Icon: JiraServerSVG},
  gitlab: {Icon: GitLabSVG},
  azureDevOps: {Icon: AzureDevOpsSVG},
  linear: {Icon: LinearSVG, className: 'dark:[&_path]:fill-white'}
}

interface Props {
  service: string | undefined
}

const TaskWatermark = (props: Props) => {
  const {service} = props
  if (!service) return null
  const entry = iconLookup[service]
  if (!entry) return null
  const {Icon, className} = entry

  return (
    <div className='pointer-events-none absolute inset-0 z-10 overflow-hidden text-center align-middle opacity-20'>
      <WatermarkSVG Icon={Icon} className={className} />
    </div>
  )
}

export default TaskWatermark
