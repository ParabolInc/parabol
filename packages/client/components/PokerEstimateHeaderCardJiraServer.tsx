import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PokerEstimateHeaderCardJiraServer_issue$key} from '../__generated__/PokerEstimateHeaderCardJiraServer_issue.graphql'
import PokerEstimateHeaderCardHtml from './PokerEstimateHeaderCardHtml'
interface Props {
  issueRef: PokerEstimateHeaderCardJiraServer_issue$key
}
const PokerEstimateHeaderCardJiraServer = (props: Props) => {
  const {issueRef} = props
  const issue = useFragment(
    graphql`
      fragment PokerEstimateHeaderCardJiraServer_issue on JiraServerIssue {
        issueKey
        summary
        descriptionHTML
        jiraUrl: url
      }
    `,
    issueRef
  )

  const {issueKey, summary, descriptionHTML, jiraUrl} = issue

  return (
    <PokerEstimateHeaderCardHtml
      summary={summary}
      descriptionHTML={descriptionHTML}
      url={jiraUrl}
      linkTitle={`Jira Server Issue #${issueKey}`}
      linkText={issueKey}
    />
  )
}

export default PokerEstimateHeaderCardJiraServer
