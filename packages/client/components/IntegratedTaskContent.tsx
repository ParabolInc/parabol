import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {IntegratedTaskContent_task$key} from '../__generated__/IntegratedTaskContent_task.graphql'
import renderMarkdown from '../utils/renderMarkdown'

interface Props {
  task: IntegratedTaskContent_task$key
}

const IntegratedTaskContent = (props: Props) => {
  const {task: taskRef} = props
  const task = useFragment(
    graphql`
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
          ... on _xLinearIssue {
            description
            title
          }
        }
      }
    `,
    taskRef
  )
  const {integration} = task
  if (!integration) return null
  if (integration.__typename === 'JiraIssue') {
    const {descriptionHTML, summary} = integration
    return (
      <div className='max-h-80 overflow-auto px-4 [&_img]:h-auto'>
        <div className='font-semibold'>{summary}</div>
        <div dangerouslySetInnerHTML={{__html: descriptionHTML}} />
      </div>
    )
  } else if (integration.__typename === 'JiraServerIssue') {
    const {descriptionHTML, summary} = integration
    return (
      <div className='max-h-80 overflow-auto px-4 [&_img]:h-auto'>
        <div className='font-semibold'>{summary}</div>
        <div dangerouslySetInnerHTML={{__html: descriptionHTML}} />
      </div>
    )
  } else if (integration.__typename === '_xGitHubIssue') {
    const {bodyHTML, title} = integration
    return (
      <div className='max-h-80 overflow-auto px-4 [&_img]:h-auto'>
        <div className='font-semibold'>{title}</div>
        <div dangerouslySetInnerHTML={{__html: bodyHTML}} />
      </div>
    )
  } else if (integration.__typename === '_xGitLabIssue') {
    const {descriptionHtml, title} = integration
    return (
      <div className='max-h-80 overflow-auto px-4 [&_img]:h-auto'>
        <div className='font-semibold'>{title}</div>
        {descriptionHtml && <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />}
      </div>
    )
  } else if (integration.__typename === 'AzureDevOpsWorkItem') {
    const {descriptionHTML, title} = integration
    return (
      <div className='max-h-80 overflow-auto px-4 [&_img]:h-auto'>
        <div className='font-semibold'>{title}</div>
        {descriptionHTML && <div dangerouslySetInnerHTML={{__html: descriptionHTML}} />}
      </div>
    )
  } else if (integration.__typename === '_xLinearIssue') {
    const {description, title} = integration
    const descriptionHTML = renderMarkdown(`${description}`)
    return (
      <div className='max-h-80 overflow-auto px-4 [&_img]:h-auto'>
        <div className='font-semibold'>{title}</div>
        {description && <div dangerouslySetInnerHTML={{__html: descriptionHTML}} />}
      </div>
    )
  }
  return null
}

export default IntegratedTaskContent
