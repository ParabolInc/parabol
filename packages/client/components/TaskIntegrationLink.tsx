import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {ReactNode} from 'react'
import {createFragmentContainer} from 'react-relay'
import {parseWebPath} from '~/utils/parseWebPath'
import {PALETTE} from '../styles/paletteV3'
import {Card} from '../types/constEnums'
import {TaskIntegrationLink_integration} from '../__generated__/TaskIntegrationLink_integration.graphql'
import JiraIssueLink from './JiraIssueLink'

const StyledLink = styled('a')({
  color: PALETTE.SLATE_700,
  display: 'block',
  fontSize: Card.FONT_SIZE,
  lineHeight: '1.25rem',
  padding: `0 ${Card.PADDING}`,
  textDecoration: 'underline',
  '&:hover,:focus': {
    textDecoration: 'underline'
  }
})

interface Props {
  integration: TaskIntegrationLink_integration | null
  dataCy: string
  className?: string
  children?: ReactNode
  showJiraLabelPrefix?: boolean
}

const TaskIntegrationLink = (props: Props) => {
  const {integration, dataCy, className, children, showJiraLabelPrefix} = props
  if (!integration) return null
  if (integration.__typename === 'JiraIssue') {
    const {issueKey, projectKey, cloudName} = integration
    return (
      <JiraIssueLink
        dataCy={`${dataCy}-jira-issue-link`}
        issueKey={issueKey}
        projectKey={projectKey}
        cloudName={cloudName}
        className={className}
        showLabelPrefix={showJiraLabelPrefix}
      >
        {children}
      </JiraIssueLink>
    )
  } else if (integration.__typename === 'JiraServerIssue') {
    const {url, issueKey, projectKey} = integration
    return (
      <StyledLink
        href={url}
        rel='noopener noreferrer'
        target='_blank'
        title={`Jira Server Issue #${issueKey} on ${projectKey}`}
        className={className}
      >
        {`Issue #${issueKey}`}
        {children}
      </StyledLink>
    )
  } else if (integration.__typename === '_xGitHubIssue') {
    const {repository, number} = integration
    const {nameWithOwner} = repository
    const href =
      nameWithOwner === 'ParabolInc/ParabolDemo'
        ? 'https://github.com/ParabolInc/parabol'
        : `https://www.github.com/${nameWithOwner}/issues/${number}`
    return (
      <StyledLink
        href={href}
        rel='noopener noreferrer'
        target='_blank'
        title={`GitHub Issue #${number} on ${nameWithOwner}`}
        className={className}
      >
        {`Issue #${number}`}
        {children}
      </StyledLink>
    )
  } else if (integration.__typename === '_xGitLabIssue') {
    const {webPath, iid, webUrl} = integration
    const {fullPath} = parseWebPath(webPath)
    return (
      <StyledLink
        href={webUrl}
        rel='noopener noreferrer'
        target='_blank'
        title={`GitLab Issue #${iid} on ${fullPath}`}
        className={className}
      >
        {`Issue #${iid}`}
        {children}
      </StyledLink>
    )
  } else if (integration.__typename === 'AzureDevOpsWorkItem') {
    const {id, teamProject, url, type} = integration
    const integrationType = type.includes('Issue') ? 'Issue' : type
    return (
      <StyledLink
        href={url}
        rel='noopener noreferrer'
        target='_blank'
        title={`Azure Item #${id} on ${teamProject}`}
        className={className}
      >
        {`${integrationType} #${id}`}
        {children}
      </StyledLink>
    )
  }
  return null
}

graphql`
  fragment TaskIntegrationLinkIntegrationJira on JiraIssue {
    issueKey
    projectKey
    cloudName
  }
`

graphql`
  fragment TaskIntegrationLinkIntegrationGitHub on _xGitHubIssue {
    number
    repository {
      nameWithOwner
    }
  }
`

graphql`
  fragment TaskIntegrationLinkIntegrationGitLab on _xGitLabIssue {
    iid
    webPath
    webUrl
  }
`

graphql`
  fragment TaskIntegrationLinkIntegrationJiraServer on JiraServerIssue {
    id
    issueKey
    projectKey
    url
  }
`

graphql`
  fragment TaskIntegrationLinkIntegrationAzure on AzureDevOpsWorkItem {
    id
    teamProject
    type
    url
  }
`

export default createFragmentContainer(TaskIntegrationLink, {
  integration: graphql`
    fragment TaskIntegrationLink_integration on TaskIntegration {
      __typename
      ...TaskIntegrationLinkIntegrationGitHub @relay(mask: false)
      ...TaskIntegrationLinkIntegrationJira @relay(mask: false)
      ...TaskIntegrationLinkIntegrationJiraServer @relay(mask: false)
      ...TaskIntegrationLinkIntegrationGitLab @relay(mask: false)
      ...TaskIntegrationLinkIntegrationAzure @relay(mask: false)
    }
  `
})
