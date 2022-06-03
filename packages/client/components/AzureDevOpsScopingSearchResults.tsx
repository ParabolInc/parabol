import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import useGetUsedServiceTaskIds from '~/hooks/useGetUsedServiceTaskIds'
import MockScopingList from '~/modules/meeting/components/MockScopingList'
import {AzureDevOpsScopingSearchResultsQuery} from '../__generated__/AzureDevOpsScopingSearchResultsQuery.graphql'
import {AzureDevOpsScopingSearchResults_meeting$key} from '../__generated__/AzureDevOpsScopingSearchResults_meeting.graphql'
import IntegrationScopingNoResults from './IntegrationScopingNoResults'
import NewIntegrationRecordButton from './NewIntegrationRecordButton'
import ScopingSearchResultItem from './ScopingSearchResultItem'

const ResultScroller = styled('div')({
  overflow: 'auto'
})

interface Props {
  meetingRef: AzureDevOpsScopingSearchResults_meeting$key
  queryRef: PreloadedQuery<AzureDevOpsScopingSearchResultsQuery>
}

const AzureDevOpsScopingSearchResults = (props: Props) => {
  const {meetingRef} = props
  const {queryRef} = props

  const query = usePreloadedQuery(
    graphql`
      query AzureDevOpsScopingSearchResultsQuery(
        $teamId: ID!
        $first: Int
        $queryString: String
        $projectKeyFilters: [String!]!
        $isWIQL: Boolean!
      ) {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              azureDevOps {
                workItems(
                  first: $first
                  queryString: $queryString
                  projectKeyFilters: $projectKeyFilters
                  isWIQL: $isWIQL
                ) @connection(key: "AzureDevOpsScopingSearchResults_workItems") {
                  error {
                    message
                  }
                  edges {
                    cursor
                    node {
                      id
                      title
                      url
                      state
                      type
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
      fragment AzureDevOpsScopingSearchResults_meeting on PokerMeeting {
        id
        teamId
        phases {
          ...useGetUsedServiceTaskIds_phase
          phaseType
        }
      }
    `,
    meetingRef
  )

  const viewer = query.viewer
  const azureDevOps = viewer?.teamMember!.integrations.azureDevOps ?? null
  const workItems = azureDevOps?.workItems ?? null
  const edges = workItems?.edges ?? null
  const error = workItems?.error ?? null

  const [isEditing, setIsEditing] = useState(false)
  const {id: meetingId, phases} = meeting
  const estimatePhase = phases.find(({phaseType}) => phaseType === 'ESTIMATE')!
  const usedServiceTaskIds = useGetUsedServiceTaskIds(estimatePhase)
  const handleAddIssueClick = () => setIsEditing(true)

  const getProjectId = (url: URL) => {
    const firstIndex = url.pathname.indexOf('/', 1)
    const seconedIndex = url.pathname.indexOf('/', firstIndex + 1)
    return url.pathname.substring(firstIndex + 1, seconedIndex)
  }

  const getInstanceId = (url: URL) => {
    const firstIndex = url.pathname.indexOf('/', 1)
    return url.host + '/' + url.pathname.substring(1, firstIndex)
  }

  const getServiceTaskId = (url: URL) => {
    return getInstanceId(url) + ':' + getProjectId(url)
  }

  if (!edges) {
    return <MockScopingList />
  }
  if (edges.length === 0 && !isEditing) {
    return (
      <>
        <IntegrationScopingNoResults error={error?.message} msg={'No issues match that query'} />
        <NewIntegrationRecordButton onClick={handleAddIssueClick} labelText={'New User Story'} />
      </>
    )
  }
  return (
    <ResultScroller>
      {edges.map(({node}) => {
        return (
          <ScopingSearchResultItem
            key={node.id}
            service={'azureDevOps'}
            usedServiceTaskIds={usedServiceTaskIds}
            serviceTaskId={getServiceTaskId(new URL(node.url)) + ':' + node.id}
            meetingId={meetingId}
            persistQuery={() => {
              return null
            }}
            summary={node.title}
            url={node.url}
            linkText={`${node.type} #${node.id}`}
            linkTitle={`Azure DevOps Work Item #${node.id}`}
          />
        )
      })}
    </ResultScroller>
  )
}

export default AzureDevOpsScopingSearchResults
