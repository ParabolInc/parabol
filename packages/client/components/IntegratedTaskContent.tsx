import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {IntegratedTaskContent_task} from '../__generated__/IntegratedTaskContent_task.graphql'

const Content = styled('div')({
  paddingLeft: 16,
  paddingRight: 16,
  maxHeight: 320,
  overflow: 'auto',
  img: {
    height: 'auto'
  }
})
const Summary = styled('div')({
  fontWeight: 600
})
interface Props {
  task: IntegratedTaskContent_task
}

const IntegratedTaskContent = (props: Props) => {
  const {task} = props
  const {integration} = task
  if (!integration) return null
  if (integration.__typename === 'JiraIssue') {
    const {descriptionHTML, summary} = integration
    return (
      <Content>
        <Summary>{summary}</Summary>
        <div dangerouslySetInnerHTML={{__html: descriptionHTML}} />
      </Content>
    )
  } else if (integration.__typename === 'JiraServerIssue') {
    const {descriptionHTML, summary} = integration
    return (
      <Content>
        <Summary>{summary}</Summary>
        <div dangerouslySetInnerHTML={{__html: descriptionHTML}} />
      </Content>
    )
  } else if (integration.__typename === '_xGitHubIssue') {
    const {bodyHTML, title} = integration
    return (
      <Content>
        <Summary>{title}</Summary>
        <div dangerouslySetInnerHTML={{__html: bodyHTML}} />
      </Content>
    )
  } else if (integration.__typename === '_xGitLabIssue') {
    const {descriptionHtml, title} = integration
    return (
      <Content>
        <Summary>{title}</Summary>
        {descriptionHtml && <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />}
      </Content>
    )
  } else if (integration.__typename === 'AzureDevOpsWorkItem') {
    const {descriptionHTML, title} = integration
    return (
      <Content>
        <Summary>{title}</Summary>
        {descriptionHTML && <div dangerouslySetInnerHTML={{__html: descriptionHTML}} />}
      </Content>
    )
  }
  return null
}

export default createFragmentContainer(IntegratedTaskContent, {
  task: graphql`
    fragment IntegratedTaskContent_task on Task {
      integration {
        __typename
        ... on JiraIssue {
          descriptionHTML
          summary
        }
        ... on _xGitHubIssue {
          bodyHTML
          title
        }
        ... on JiraServerIssue {
          descriptionHTML
          summary
        }
        ... on _xGitLabIssue {
          descriptionHtml
          title
        }
        ... on AzureDevOpsWorkItem {
          descriptionHTML
          title
        }
      }
    }
  `
})
