import React from 'react'
import AzureDevOpsSVG from './AzureDevOpsSVG'
import GitHubSVG from './GitHubSVG'
import GitLabSVG from './GitLabSVG'
import JiraSVG from './JiraSVG'
import JiraServerSVG from './JiraServerSVG'
import LinearSVG from './LinearSVG'

// We need to update the SVG components to accept size props or create wrapper components
// For this implementation, we'll create a wrapper that ensures 120x120 sizing

interface WatermarkSVGProps {
  Icon: React.ComponentType
}

const WatermarkSVG = ({Icon}: WatermarkSVGProps) => (
  <div className='absolute right-[24px] bottom-[8px] scale-500 transform'>
    <Icon />
  </div>
)

const iconLookup = {
  _xGitHubIssue: GitHubSVG,
  JiraIssue: JiraSVG,
  JiraServerIssue: JiraServerSVG,
  _xGitLabIssue: GitLabSVG,
  AzureDevOpsWorkItem: AzureDevOpsSVG,
  _xLinearIssue: LinearSVG
} as const

interface Props {
  type: string | undefined
}

const TaskWatermark = (props: Props) => {
  const {type} = props
  if (!type) return null
  const Icon = iconLookup[type as keyof typeof iconLookup]
  if (!Icon) return null

  return (
    <div className='pointer-events-none absolute inset-0 z-10 overflow-hidden text-center align-middle opacity-20'>
      <WatermarkSVG Icon={Icon} />
    </div>
  )
}

export default TaskWatermark
