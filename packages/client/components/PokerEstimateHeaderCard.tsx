import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PokerEstimateHeaderCard_stage} from '../__generated__/PokerEstimateHeaderCard_stage.graphql'
import PokerEstimateHeaderCardContent, {
  PokerEstimateHeaderCardContentProps
} from './PokerEstimateHeaderCardContent'
import PokerEstimateHeaderCardError from './PokerEstimateHeaderCardError'
import PokerEstimateHeaderCardParabol from './PokerEstimateHeaderCardParabol'

interface Props {
  stage: PokerEstimateHeaderCard_stage
}

type Integration = NonNullable<PokerEstimateHeaderCard_stage['task']>['integration']

const getHeaderFields = (
  integration: Integration | null
): PokerEstimateHeaderCardContentProps | null => {
  if (!integration) return null
  const {__typename} = integration
  switch (__typename) {
    case 'JiraServerIssue':
    case 'JiraIssue':
      const name = __typename === 'JiraIssue' ? 'Jira' : 'Jira Server'
      const {summary, descriptionHTML, jiraUrl, issueKey} = integration
      return {
        cardTitle: summary,
        descriptionHTML,
        url: jiraUrl,
        linkTitle: `${name} Issue #${issueKey}`,
        linkText: issueKey
      }
    case '_xGitHubIssue':
      const {number, title: githubTitle, bodyHTML, url} = integration
      return {
        cardTitle: githubTitle,
        descriptionHTML: bodyHTML,
        url,
        linkTitle: `GitHub Issue #${number}`,
        linkText: `#${number}`
      }
    case 'AzureDevOpsWorkItem':
      const {
        title: azureDevOpsTitle,
        teamProject,
        url: azureDevOpsUrl,
        id: workItemId
      } = integration
      return {
        cardTitle: azureDevOpsTitle,
        descriptionHTML: teamProject,
        url: azureDevOpsUrl,
        linkTitle: `${azureDevOpsTitle} Issue #${workItemId}`,
        linkText: `#${workItemId}`
      }
    case '_xGitLabIssue':
      const {iid, title, descriptionHtml, webUrl} = integration
      return {
        cardTitle: title,
        descriptionHTML: descriptionHtml ?? '',
        url: webUrl,
        linkTitle: `GitLab Issue #${iid}`,
        linkText: `#${iid}`
      }
  }
  return null
}

const PokerEstimateHeaderCard = (props: Props) => {
  const {stage} = props
  const {task} = stage
  console.log(`stage: ${stage}`)
  console.log(`stage: ${task}`)
  if (!task) {
    return <PokerEstimateHeaderCardError />
  }

  const {integrationHash, integration} = task
  // it's a vanilla parabol task.
  if (!integrationHash) {
    return <PokerEstimateHeaderCardParabol task={task} />
  }
  // it's an integrated task, but the service might be down
  const headerFields = getHeaderFields(integration)
  console.log(`headerFields: ${headerFields}`)
  if (!headerFields) {
    return <PokerEstimateHeaderCardError service={'Integration'} />
  } else {
    console.log(`integration json: ${JSON.stringify(integration)}`)
  }
  /*
  if (integration.__typename === 'JiraIssue' || integration.__typename === 'JiraServerIssue') {
    const name = integration.__typename === 'JiraIssue' ? 'Jira' : 'Jira Server'
    return (
      <PokerEstimateHeaderCardContent
        cardTitle={integration.summary}
        descriptionHTML={integration.descriptionHTML}
        url={integration.jiraUrl}
        linkTitle={`${name} Issue #${integration.issueKey}`}
        linkText={integration.issueKey}
      />
    )
  }
  if (integration.__typename === 'AzureDevOpsWorkItem') {
    return (
      <PokerEstimateHeaderCardContent
        cardTitle={integration.title}
        descriptionHTML={integration.teamProject}
        url={integration.url}
        linkTitle={`${integration.title} Issue #${integration.id}`}
        linkText={integration.id}
      />
    )
  }

  if (integration.__typename === '_xGitHubIssue') {
    return <PokerEstimateHeaderCardGitHub issueRef={integration} />
  }*/

  return <PokerEstimateHeaderCardContent {...headerFields} />
}

export default createFragmentContainer(PokerEstimateHeaderCard, {
  stage: graphql`
    fragment PokerEstimateHeaderCard_stage on EstimateStage {
      task {
        ...PokerEstimateHeaderCardParabol_task
        integrationHash
        integration {
          ... on AzureDevOpsWorkItem {
            __typename
            id
            title
            teamProject
            type
            state
            url
          }
          ... on JiraIssue {
            __typename
            issueKey
            summary
            descriptionHTML
            jiraUrl: url
          }
          ... on JiraServerIssue {
            __typename
            issueKey
            summary
            descriptionHTML
            jiraUrl: url
          }
          ... on _xGitHubIssue {
            __typename
            number
            title
            bodyHTML
            url
          }
          ... on _xGitLabIssue {
            __typename
            descriptionHtml
            title
            webUrl
            iid
          }
        }
      }
    }
  `
})
