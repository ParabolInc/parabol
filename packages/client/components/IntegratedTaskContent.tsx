import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {IntegratedTaskContent_task} from '../__generated__/IntegratedTaskContent_task.graphql'

interface Props {
  task: IntegratedTaskContent_task
}

const IntegratedTaskContent = (props: Props) => {
  const {task} = props
  const {integration} = task
  if (!integration) return null
  if (integration.__typename === 'JiraIssue') {
    const {descriptionHTML} = integration
return (
    <div dangerouslySetInnerHTML={{__html: descriptionHTML}}/>
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
        }
      }
    }
  `
})
