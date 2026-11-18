import graphql from 'babel-plugin-relay/macro'
import {useMemo, useState} from 'react'
import {useFragment} from 'react-relay'
import type {
  PokerEstimateHeaderCardIssue_stage$data,
  PokerEstimateHeaderCardIssue_stage$key
} from '../__generated__/PokerEstimateHeaderCardIssue_stage.graphql'
import type {PokerEstimateHeaderCardIssueQuery as TPokerEstimateHeaderCardIssueQuery} from '../__generated__/PokerEstimateHeaderCardIssueQuery.graphql'
import type Atmosphere from '../Atmosphere'
import useAtmosphere from '../hooks/useAtmosphere'
import getClickUpTaskLinkTitle from '../integrations/clickup/getClickUpTaskLinkTitle'
import {convertADFToTipTap} from '../shared/tiptap/convertADFToTipTap'
import renderMarkdown from '../utils/renderMarkdown'
import PokerEstimateHeaderCardError from './PokerEstimateHeaderCardError'
import PokerEstimateHeaderCardIntegration, {
  type HeaderFields
} from './PokerEstimateHeaderCardIntegration'

const refreshStoryIntegrationQuery = graphql`
  query PokerEstimateHeaderCardIssueQuery($meetingId: ID!, $storyId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        ... on PokerMeeting {
          story(storyId: $storyId) {
            ...PokerEstimateHeaderCardIssueTask @relay(mask: false)
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
  return atmosphere.fetchQuery<TPokerEstimateHeaderCardIssueQuery>(
    refreshStoryIntegrationQuery,
    variables,
    {
      fetchPolicy: 'network-only'
    }
  )
}

interface Props {
  stage: PokerEstimateHeaderCardIssue_stage$key
  onRemove: () => void
}

type Integration = NonNullable<PokerEstimateHeaderCardIssue_stage$data['task']>['integration']

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
        descriptionHTML: descriptionHTML ?? '',
        url: jiraUrl,
        linkTitle: `${name} Issue #${issueKey}`,
        linkText: issueKey
      }
    }
    case '_xGitHubIssue': {
      const {number, title: githubTitle, bodyHTML, ghUrl} = integration
      return {
        cardTitle: githubTitle,
        descriptionHTML: bodyHTML ?? '',
        url: ghUrl,
        linkTitle: `GitHub Issue #${number}`,
        linkText: `#${number}`
      }
    }
    case 'AzureDevOpsWorkItem': {
      const {
        title: azureDevOpsTitle,
        url: azureDevOpsUrl,
        workItemKey: workItemId,
        descriptionHTML
      } = integration
      return {
        cardTitle: azureDevOpsTitle,
        descriptionHTML: descriptionHTML ?? '',
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
    case 'ClickUpTask': {
      const {title: clickUpTitle, clickUpDescription, clickUpUrl, customId, taskId} = integration
      return {
        cardTitle: clickUpTitle,
        descriptionHTML: renderMarkdown(clickUpDescription || '_no description found_'),
        url: clickUpUrl,
        linkTitle: getClickUpTaskLinkTitle(integration),
        linkText: customId ?? taskId
      }
    }
  }
  return null
}

graphql`
  fragment PokerEstimateHeaderCardIssueTask on Task {
    integration {
      ... on AzureDevOpsWorkItem {
        __typename
        id
        workItemKey: issueKey
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
      ... on ClickUpTask {
        __typename
        title
        clickUpDescription: description
        clickUpUrl: url
        taskId
        customId
        listName
        folderName
      }
    }
  }
`

const PokerEstimateHeaderCardIssue = (props: Props) => {
  const {stage: stageRef, onRemove} = props
  const atmosphere = useAtmosphere()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const stage = useFragment(
    graphql`
      fragment PokerEstimateHeaderCardIssue_stage on EstimateStage {
        ...PokerEstimateHeaderCardIntegration_stage
        creatorUserId
        meetingId
        taskId
        task {
          ...PokerEstimateHeaderCardIssueTask @relay(mask: false)
        }
      }
    `,
    stageRef
  )
  const {meetingId, taskId, task, creatorUserId} = stage
  const integration = task?.integration ?? null
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

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await RefreshStoryIntegration(atmosphere, {storyId: taskId, meetingId})
    } finally {
      setIsRefreshing(false)
    }
  }

  const headerFields = getHeaderFields(integration)
  if (!headerFields) {
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

export default PokerEstimateHeaderCardIssue
