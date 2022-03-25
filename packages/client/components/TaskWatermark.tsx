import styled from '@emotion/styled'
import React from 'react'
import GitHubSVG from './GitHubSVG'
import JiraSVG from './JiraSVG'
import JiraServerSVG from './JiraServerSVG'

const iconLookup = {
  _xGitHubIssue: GitHubSVG,
  JiraIssue: JiraSVG,
  JiraServerIssue: JiraServerSVG
}

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
  const SVG = iconLookup[type]
  if (!SVG) return null
  return (
    <WatermarkBlock>
      <SVG />
    </WatermarkBlock>
  )
}

export default TaskWatermark
