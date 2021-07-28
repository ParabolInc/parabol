import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PokerEstimateHeaderCard_stage} from '../__generated__/PokerEstimateHeaderCard_stage.graphql'
import PokerEstimateHeaderCardError from './PokerEstimateHeaderCardError'
import PokerEstimateHeaderCardJira from './PokerEstimateHeaderCardJira'
import PokerEstimateHeaderCardParabol from './PokerEstimateHeaderCardParabol'

interface Props {
  stage: PokerEstimateHeaderCard_stage
}
const PokerEstimateHeaderCard = (props: Props) => {
  const {stage} = props
  const {story, service} = stage
  if (!story) {
    return <PokerEstimateHeaderCardError service={service} />
  }

  // Old way
  if (service === 'jira') {
    return <PokerEstimateHeaderCardJira issue={story} />
  }

  // New way. A parabol task that might be integrated
  const {integrationHash, integration} = story

  // it's a vanilla parabol task.
  if (!integrationHash) {
    return <PokerEstimateHeaderCardParabol task={story} />
  }

  // it's an intergrated task, but the service might be down
  if (!integration) {
    return <PokerEstimateHeaderCardError service={service} />
  }
  if (integration.__typename === 'JiraIssue') {
    return <PokerEstimateHeaderCardJira issue={integration} />
  }
  return null
}

export default createFragmentContainer(PokerEstimateHeaderCard, {
  stage: graphql`
    fragment PokerEstimateHeaderCard_stage on EstimateStage {
      service
      story {
        ...PokerEstimateHeaderCardJira_issue
        ...PokerEstimateHeaderCardParabol_task
        ... on Task {
          integrationHash
          integration {
            ... on JiraIssue {
              __typename
              ...PokerEstimateHeaderCardJira_issue
            }
            ... on _xGitHubIssue {
              __typename
            }
          }
        }
      }
    }
  `
})
