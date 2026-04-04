import graphql from 'babel-plugin-relay/macro'
import {useMemo, useState} from 'react'
import {useFragment} from 'react-relay'
import type {
  PokerEstimateHeaderCard_stage$data,
  PokerEstimateHeaderCard_stage$key
} from '../__generated__/PokerEstimateHeaderCard_stage.graphql'
import type {PokerEstimateHeaderCardQuery as TPokerEstimateHeaderCardQuery} from '../__generated__/PokerEstimateHeaderCardQuery.graphql'
import type Atmosphere from '../Atmosphere'
import useAtmosphere from '../hooks/useAtmosphere'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import {convertADFToTipTap} from '../shared/tiptap/convertADFToTipTap'
import renderMarkdown from '../utils/renderMarkdown'
import PokerEstimateHeaderCardError from './PokerEstimateHeaderCardError'
import PokerEstimateHeaderCardIntegration, {
  type HeaderFields
} from './PokerEstimateHeaderCardIntegration'
import PokerEstimateHeaderCardParabol from './PokerEstimateHeaderCardParabol'

const refreshStoryIntegrationQuery = graphql`
  query PokerEstimateHeaderCardQuery($meetingId: ID!, $storyId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        ... on PokerMeeting {
          story(storyId: $storyId) {
            ... PokerEstimateHeaderCardTask @relay(mask: false)
          }
        }
      }
    }
  }
`

const RefreshStoryIntegration = async (
  atmosphere: Atmosphere,
  variables: {meetingId: string; storyId: string}
) => {
  return atmosphere.fetchQuery<TPokerEstimateHeaderCardQuery>(
    refreshStoryIntegrationQuery,
    variables,
    {
      fetchPolicy: 'network-only'
    }
  )
}

interface Props {
  stage: PokerEstimateHeaderCard_stage$key
}

type Integration = NonNullable<PokerEstimateHeaderCard_stage$data['task']>['integration']

const getHeaderFields = (integration: Integration | null): HeaderFields | null => {
  if (!integration) return null
  const {__typename} = integration
  switch (__typename) {
    case 'JiraServerIssue':
    case 'JiraIssue': {
      const name = __typename === 'JiraIssue' ? 'Jira' : 'Jira Data Center'
      const {summary, descriptionHTML, jiraUrl, issueKey} = integration
      return {
        cardTitle: summary,
        descriptionHTML,
        url: jiraUrl,
        linkTitle: `${name} Issue #${issueKey}`,
        linkText: issueKey
      }
    }
    case '_xGitHubIssue': {
      const {number, title: githubTitle, bodyHTML, ghUrl} = integration
      return {
        cardTitle: githubTitle,
        descriptionHTML: bodyHTML,
        url: ghUrl,
        linkTitle: `GitHub Issue #${number}`,
        linkText: `#${number}`
      }
    }
    case 'AzureDevOpsWorkItem': {
      const {
        title: azureDevOpsTitle,
        url: azureDevOpsUrl,
        id: workItemId,
        descriptionHTML
      } = integration
      return {
        cardTitle: azureDevOpsTitle,
        descriptionHTML,
        url: azureDevOpsUrl,
        linkTitle: `${azureDevOpsTitle} Issue #${workItemId}`,
        linkText: `#${workItemId}`
      }
    }
    case '_xGitLabIssue': {
      const {iid, title: gitlabTitle, descriptionHtml, webUrl} = integration
      return {
        cardTitle: gitlabTitle,
        descriptionHTML: descriptionHtml ?? '',
        url: webUrl,
        linkTitle: `GitLab Issue #${iid}`,
        linkText: `#${iid}`
      }
    }
    case '_xLinearIssue': {
      const {identifier, title: linearTitle, description, url} = integration
      return {
        cardTitle: linearTitle,
        descriptionHTML: renderMarkdown(description ?? '_no description found_') ?? '',
        url,
        linkTitle: `Linear Issue #${identifier}`,
        linkText: `#${identifier}`
      }
    }
  }
  return null
}

graphql`
  fragment PokerEstimateHeaderCardTask on Task {
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
        jiraDescription: description
        descriptionHTML
        jiraUrl: url
        cloudId
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
`

const PokerEstimateHeaderCard = (props: Props) => {
  const {stage: stageRef} = props
  const atmosphere = useAtmosphere()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const stage = useFragment(
    graphql`
      fragment PokerEstimateHeaderCard_stage on EstimateStage {
        ...PokerEstimateHeaderCardIntegration_stage
        creatorUserId
        meetingId
        taskId
        task {
          ...PokerEstimateHeaderCardTask @relay(mask: false)
        }
      }
    `,
    stageRef
  )
  const {meetingId, task, creatorUserId} = stage
  const integration = task?.integration
  const editorContent = useMemo(() => {
    if (creatorUserId !== atmosphere.viewerId) return null
    if (integration?.__typename !== 'JiraIssue' || !integration.jiraDescription) return null
    try {
      const adf = JSON.parse(integration.jiraDescription)
      return JSON.stringify(convertADFToTipTap(adf, integration.summary))
    } catch {
      return null
    }
  }, [integration, creatorUserId, atmosphere.viewerId])

  if (!task) {
    const {taskId} = stage
    const onRemove = () => {
      UpdatePokerScopeMutation(
        atmosphere,
        {meetingId, updates: [{service: 'PARABOL', serviceTaskId: taskId, action: 'DELETE'}]},
        {onCompleted: () => {}, onError: () => {}, contents: []}
      )
    }
    return <PokerEstimateHeaderCardError onRemove={onRemove} />
  }

  const handleRefresh = async () => {
    if (!integrationHash) return
    setIsRefreshing(true)
    try {
      await RefreshStoryIntegration(atmosphere, {storyId: stage.taskId, meetingId})
    } finally {
      setIsRefreshing(false)
    }
  }

  const {integrationHash} = task
  if (!integrationHash) {
    return <PokerEstimateHeaderCardParabol task={task} />
  }

  const headerFields = getHeaderFields(integration)
  if (!headerFields) {
    const onRemove = () => {
      UpdatePokerScopeMutation(
        atmosphere,
        {
          meetingId,
          updates: [{service: 'PARABOL', serviceTaskId: integrationHash, action: 'DELETE'}]
        },
        {onCompleted: () => {}, onError: () => {}, contents: []}
      )
    }
    return <PokerEstimateHeaderCardError service={'Integration'} onRemove={onRemove} />
  }

  return (
    <PokerEstimateHeaderCardIntegration
      stageRef={stage}
      headerFields={headerFields}
      editorContent={editorContent}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
    />
  )
}

export default PokerEstimateHeaderCard
