import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PokerEstimateHeaderCard_stage} from '../__generated__/PokerEstimateHeaderCard_stage.graphql'
import PokerEstimateHeaderCardContent from './PokerEstimateHeaderCardContent'
import PokerEstimateHeaderCardError from './PokerEstimateHeaderCardError'
import PokerEstimateHeaderCardParabol from './PokerEstimateHeaderCardParabol'

interface Props {
  stage: PokerEstimateHeaderCard_stage
}

type Integration = NonNullable<NonNullable<PokerEstimateHeaderCard_stage['task']>['integration']>
export type IntegrationHeaderFields = {
  cardTitle: string
  descriptionHTML: string
  url: string
  linkTitle: string
  linkText: string
}

const getHeaderFields = (integration: Integration | null): IntegrationHeaderFields | null => {
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
    case '_xGitLabIssue':
      const {iid, title, descriptionHtml, webUrl} = integration
      return {
        cardTitle: title,
        descriptionHTML: descriptionHtml || '',
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
    return <PokerEstimateHeaderCardError service={'Integration'} />
  }

  const {cardTitle, descriptionHTML, url, linkTitle, linkText} = headerFields
  return (
    <PokerEstimateHeaderCardContent
      cardTitle={cardTitle}
      descriptionHTML={descriptionHTML}
      url={url}
      linkTitle={linkTitle}
      linkText={linkText}
    />
  )
}

export default createFragmentContainer(PokerEstimateHeaderCard, {
  stage: graphql`
    fragment PokerEstimateHeaderCard_stage on EstimateStage {
      task {
        ...PokerEstimateHeaderCardParabol_task
        integrationHash
        integration {
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
