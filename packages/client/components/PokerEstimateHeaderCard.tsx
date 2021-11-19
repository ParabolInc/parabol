import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PokerEstimateHeaderCard_stage} from '../__generated__/PokerEstimateHeaderCard_stage.graphql'
import PokerEstimateHeaderCardError from './PokerEstimateHeaderCardError'
import PokerEstimateHeaderCardGitHub from './PokerEstimateHeaderCardGitHub'
import PokerEstimateHeaderCardJira from './PokerEstimateHeaderCardJira'
import PokerEstimateHeaderCardParabol from './PokerEstimateHeaderCardParabol'

interface Props {
  stage: PokerEstimateHeaderCard_stage
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
  if (!integration) {
    return <PokerEstimateHeaderCardError service={'Integration'} />
  }
  if (integration.__typename === 'JiraIssue') {
    return <PokerEstimateHeaderCardJira issue={integration} />
  }
  if (integration.__typename === '_xGitHubIssue') {
    return <PokerEstimateHeaderCardGitHub issueRef={integration} />
  }
  return null
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
            ...PokerEstimateHeaderCardJira_issue
          }
          ... on _xGitHubIssue {
            __typename
            ...PokerEstimateHeaderCardGitHub_issue
          }
        }
      }
    }
  `
})
