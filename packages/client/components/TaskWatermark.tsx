import styled from '@emotion/styled'
import React from 'react'
import AzureDevOpsSVG from './AzureDevOpsSVG'
import GitHubSVG from './GitHubSVG'
import GitLabSVG from './GitLabSVG'
import JiraServerSVG from './JiraServerSVG'
import JiraSVG from './JiraSVG'

const iconLookup = {
  _xGitHubIssue: GitHubSVG,
  JiraIssue: JiraSVG,
  JiraServerIssue: JiraServerSVG,
  _xGitLabIssue: GitLabSVG,
  AzureDevOpsWorkItem: AzureDevOpsSVG
} as const

const WatermarkBlock = styled('div')({
  bottom: 0,
  left: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  position: 'absolute',
  right: 0,
  textAlign: 'center',
  top: 0,
  verticalAlign: 'middle',
  opacity: 0.2,
  zIndex: 1,
  '& svg': {
    height: 120,
    width: 120,
    position: 'absolute',
    bottom: -24,
    right: -24
  }
})

interface Props {
  type: string | undefined
}
const TaskWatermark = (props: Props) => {
  const {type} = props
  if (!type) return null
  const SVG = iconLookup[type as keyof typeof iconLookup]
  if (!SVG) return null
  return (
    <WatermarkBlock>
      <SVG />
    </WatermarkBlock>
  )
}

export default TaskWatermark
