import {TaskIntegrationLink_integration} from '__generated__/TaskIntegrationLink_integration.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import ui from 'universal/styles/ui'
import {TaskServiceEnum} from 'universal/types/graphql'

const StyledLink = styled('a')({
  color: ui.colorText,
  display: 'block',
  fontSize: ui.cardContentFontSize,
  lineHeight: '1.25rem',
  padding: `0 ${ui.cardPaddingBase}`,
  textDecoration: 'underline',
  '&:hover,:focus': {
    textDecoration: 'underline'
  }
})

interface Props {
  integration: TaskIntegrationLink_integration
}

const TaskIntegrationLink = (props: Props) => {
  const {integration} = props
  if (!integration) return null
  const {service} = integration
  if (service === TaskServiceEnum.jira) {
    const {issueKey, projectKey, cloudName} = integration
    const href =
      cloudName === 'jira-demo'
        ? 'https://www.parabol.co/features/integrations'
        : `https://${cloudName}.atlassian.net/browse/${issueKey}`
    return (
      <StyledLink
        href={href}
        rel='noopener noreferrer'
        target='_blank'
        title={`Jira Issue #${issueKey} on ${projectKey}`}
      >
        {`Issue #${issueKey}`}
      </StyledLink>
    )
  } else if (service === TaskServiceEnum.github) {
    const {nameWithOwner, issueNumber} = integration
    const href =
      nameWithOwner === 'ParabolInc/ParabolDemo'
        ? 'https://github.com/ParabolInc/action'
        : `https://www.github.com/${nameWithOwner}/issues/${issueNumber}`
    return (
      <StyledLink
        href={href}
        rel='noopener noreferrer'
        target='_blank'
        title={`GitHub Issue #${issueNumber} on ${nameWithOwner}`}
      >
        {`Issue #${issueNumber}`}
      </StyledLink>
    )
  }
  return null
}

graphql`
  fragment TaskIntegrationLinkIntegrationJira on TaskIntegrationJira {
    issueKey
    projectKey
    cloudName
  }
`

graphql`
  fragment TaskIntegrationLinkIntegrationGitHub on TaskIntegrationGitHub {
    issueNumber
    nameWithOwner
  }
`

export default createFragmentContainer(
  TaskIntegrationLink,
  graphql`
    fragment TaskIntegrationLink_integration on TaskIntegration {
      service
      ...TaskIntegrationLinkIntegrationGitHub @relay(mask: false)
      ...TaskIntegrationLinkIntegrationJira @relay(mask: false)
    }
  `
)
