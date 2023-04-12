import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import useGetUsedServiceTaskIds from '~/hooks/useGetUsedServiceTaskIds'
import MockScopingList from '~/modules/meeting/components/MockScopingList'
import {AzureDevOpsScopingSearchResultsQuery} from '../__generated__/AzureDevOpsScopingSearchResultsQuery.graphql'
import {AzureDevOpsScopingSearchResults_meeting$key} from '../__generated__/AzureDevOpsScopingSearchResults_meeting.graphql'
import IntegrationScopingNoResults from './IntegrationScopingNoResults'
import NewAzureIssueInput from './NewAzureIssueInput'
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
          ...NewAzureIssueInput_viewer
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
                      issueKey
                      project {
                        name
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
    queryRef
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
    <>
      <ResultScroller>
        {query && (
          <NewAzureIssueInput
            isEditing={isEditing}
            meetingId={meetingId}
            setIsEditing={setIsEditing}
            viewerRef={viewer}
          />
        )}
        {edges.map(({node}) => (
          <ScopingSearchResultItem
            key={node.id}
            service={'azureDevOps'}
            usedServiceTaskIds={usedServiceTaskIds}
            serviceTaskId={node.id}
            meetingId={meetingId}
            summary={node.title}
            url={node.url}
            linkText={`#${node.issueKey} ${node.project.name}`}
            linkTitle={`Azure DevOps Work Item #${node.issueKey}`}
          />
        ))}
      </ResultScroller>
      {!isEditing && (
        <NewIntegrationRecordButton onClick={handleAddIssueClick} labelText={'New Issue'} />
      )}
    </>
  )
}

export default AzureDevOpsScopingSearchResults
