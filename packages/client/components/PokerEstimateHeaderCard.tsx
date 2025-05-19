import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {
  PokerEstimateHeaderCard_stage$data,
  PokerEstimateHeaderCard_stage$key
} from '../__generated__/PokerEstimateHeaderCard_stage.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import renderMarkdown from '../utils/renderMarkdown'
import PokerEstimateHeaderCardContent, {
  PokerEstimateHeaderCardContentProps
} from './PokerEstimateHeaderCardContent'
import PokerEstimateHeaderCardError from './PokerEstimateHeaderCardError'
import PokerEstimateHeaderCardParabol from './PokerEstimateHeaderCardParabol'

interface Props {
  stage: PokerEstimateHeaderCard_stage$key
}

type Integration = NonNullable<PokerEstimateHeaderCard_stage$data['task']>['integration']

const getHeaderFields = (
  integration: Integration | null
): PokerEstimateHeaderCardContentProps | null => {
  if (!integration) return null
  const {__typename} = integration
  switch (__typename) {
    case 'JiraServerIssue':
    case 'JiraIssue':
      const name = __typename === 'JiraIssue' ? 'Jira' : 'Jira Data Center'
      const {summary, descriptionHTML, jiraUrl, issueKey} = integration
      return {
        cardTitle: summary,
        descriptionHTML,
        url: jiraUrl,
        linkTitle: `${name} Issue #${issueKey}`,
        linkText: issueKey
      }
    case '_xGitHubIssue':
      const {number, title: githubTitle, bodyHTML, ghUrl} = integration
      return {
        cardTitle: githubTitle,
        descriptionHTML: bodyHTML,
        url: ghUrl,
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
      const {iid, title: gitlabTitle, descriptionHtml, webUrl} = integration
      return {
        cardTitle: gitlabTitle,
        descriptionHTML: descriptionHtml ?? '',
        url: webUrl,
        linkTitle: `GitLab Issue #${iid}`,
        linkText: `#${iid}`
      }
    case '_xLinearIssue':
      const {identifier, title: linearTitle, description, url} = integration
      const linearDescHTML = renderMarkdown(description ?? '_no description found_')
      return {
        cardTitle: linearTitle,
        descriptionHTML: linearDescHTML ?? '',
        url: url,
        linkTitle: `Linear Issue #${identifier}`,
        linkText: `#${identifier}`
      }
  }
  return null
}

const PokerEstimateHeaderCard = (props: Props) => {
  const {stage: stageRef} = props
  const atmosphere = useAtmosphere()
  const stage = useFragment(
    graphql`
      fragment PokerEstimateHeaderCard_stage on EstimateStage {
        meetingId
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
              ghUrl: url
            }
            ... on _xGitLabIssue {
              __typename
              descriptionHtml
              title
              webUrl
              iid
            }
            ... on _xLinearIssue {
              __typename
              description
              title
              url
              identifier
            }
          }
        }
      }
    `,
    stageRef
  )
  const {meetingId, task} = stage
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
    const onRemove = () => {
      UpdatePokerScopeMutation(
        atmosphere,
        {
          meetingId,
          updates: [
            {
              // since this is a delete the service doesn't matter
              service: 'PARABOL',
              serviceTaskId: integrationHash,
              action: 'DELETE'
            }
          ]
        },
        {
          onCompleted: () => {},
          onError: () => {},
          contents: []
        }
      )
    }
    return <PokerEstimateHeaderCardError service={'Integration'} onRemove={onRemove} />
  }
  return <PokerEstimateHeaderCardContent {...headerFields} />
}

export default PokerEstimateHeaderCard
