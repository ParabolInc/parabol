import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import useGetUsedServiceTaskIds from '~/hooks/useGetUsedServiceTaskIds'
import MockScopingList from '~/modules/meeting/components/MockScopingList'
import useAtmosphere from '../hooks/useAtmosphere'
import PersistJiraServerSearchQueryMutation from '../mutations/PersistJiraServerSearchQueryMutation'
import {JiraServerScopingSearchResultsQuery} from '../__generated__/JiraServerScopingSearchResultsQuery.graphql'
import {JiraServerScopingSearchResults_meeting$key} from '../__generated__/JiraServerScopingSearchResults_meeting.graphql'
import IntegrationScopingNoResults from './IntegrationScopingNoResults'
import NewIntegrationRecordButton from './NewIntegrationRecordButton'
import ScopingSearchResultItem from './ScopingSearchResultItem'

const ResultScroller = styled('div')({
  overflow: 'auto'
})

interface Props {
  meetingRef: JiraServerScopingSearchResults_meeting$key
  queryRef: PreloadedQuery<JiraServerScopingSearchResultsQuery>
}

const JiraServerScopingSearchResults = (props: Props) => {
  const {meetingRef} = props
  const {queryRef} = props
  const atmosphere = useAtmosphere()

  const query = usePreloadedQuery(
    graphql`
      query JiraServerScopingSearchResultsQuery(
        $teamId: ID!
        $queryString: String
        $isJQL: Boolean!
        $projectKeyFilters: [ID!]
        $first: Int
      ) {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              jiraServer {
                providerId
                searchQueries {
                  queryString
                  isJQL
                  projectKeyFilters
                }
                issues(
                  first: $first
                  queryString: $queryString
                  isJQL: $isJQL
                  projectKeyFilters: $projectKeyFilters
                ) @connection(key: "JiraServerScopingSearchResults_issues") {
                  error {
                    message
                  }
                  edges {
                    node {
                      id
                      ... on JiraServerIssue {
                        summary
                        url
                        issueKey
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
  )

  const meeting = useFragment(
    graphql`
      fragment JiraServerScopingSearchResults_meeting on PokerMeeting {
        id
        teamId
        jiraServerSearchQuery {
          isJQL
          projectKeyFilters
          queryString
        }
        phases {
          ...useGetUsedServiceTaskIds_phase
          phaseType
        }
      }
    `,
    meetingRef
  )

  const viewer = query.viewer
  const {jiraServerSearchQuery, teamId} = meeting

  const jiraServer = viewer?.teamMember!.integrations.jiraServer ?? null
  const providerId = jiraServer?.providerId ?? null
  const issues = jiraServer?.issues ?? null
  const edges = issues?.edges ?? null
  const error = issues?.error ?? null
  const [isEditing, setIsEditing] = useState(false)
  const {id: meetingId, phases} = meeting
  const estimatePhase = phases.find(({phaseType}) => phaseType === 'ESTIMATE')!
  const usedServiceTaskIds = useGetUsedServiceTaskIds(estimatePhase)
  const handleAddIssueClick = () => setIsEditing(true)

  // even though it's a little herky jerky, we need to give the user feedback that a search is pending
  // TODO fix flicker after viewer is present but edges isn't set
  if (!edges) {
    return <MockScopingList />
  }
  if (edges.length === 0 && !isEditing) {
    return (
      <>
        <IntegrationScopingNoResults error={error?.message} msg={'No issues match that query'} />
        <NewIntegrationRecordButton onClick={handleAddIssueClick} labelText={'New Issue'} />
      </>
    )
  }

  const persistQuery = () => {
    const {queryString, isJQL} = jiraServerSearchQuery
    // don't persist an empty string (the default)
    if (!queryString) return
    const projectKeyFilters = jiraServerSearchQuery.projectKeyFilters as string[]
    projectKeyFilters.sort()
    const lookupKey = JSON.stringify({queryString, projectKeyFilters})
    const {searchQueries} = jiraServer!
    const searchHashes = searchQueries.map(({queryString, projectKeyFilters}) => {
      return JSON.stringify({queryString, projectKeyFilters})
    })
    const isQueryNew = !searchHashes.includes(lookupKey)

    if (isQueryNew) {
      PersistJiraServerSearchQueryMutation(atmosphere, {
        teamId,
        service: 'jiraServer',
        providerId,
        isRemove: false,
        jiraServerSearchQuery: {
          queryString,
          isJQL,
          projectKeyFilters: projectKeyFilters as string[]
        }
      })
    }
  }

  return (
    <ResultScroller>
      {edges.map(({node}) => {
        return (
          <ScopingSearchResultItem
            key={node.id}
            service={'jiraServer'}
            usedServiceTaskIds={usedServiceTaskIds}
            serviceTaskId={node.id}
            meetingId={meetingId}
            persistQuery={persistQuery}
            summary={node.summary}
            url={node.url}
            linkText={node.issueKey}
            linkTitle={`Jira Server Issue #${node.issueKey}`}
          />
        )
      })}
    </ResultScroller>
  )
}

export default JiraServerScopingSearchResults
