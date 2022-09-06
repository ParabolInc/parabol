import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
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
        url: azureDevOpsUrl,
        id: workItemId,
        descriptionHTML: azureDevOpsDescriptionHTML
      } = integration
      return {
        cardTitle: azureDevOpsTitle,
        descriptionHTML: azureDevOpsDescriptionHTML,
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

  const {t} = useTranslation()

  const {task} = stage
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
  if (!headerFields) {
    return <PokerEstimateHeaderCardError service={t('PokerEstimateHeaderCard.Integration')} />
  }
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
            descriptionHTML
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
