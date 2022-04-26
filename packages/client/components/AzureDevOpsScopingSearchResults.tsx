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
                userStories(
                  first: $first
                  queryString: $queryString
                  projectKeyFilters: $projectKeyFilters
                  isWIQL: $isWIQL
                ) @connection(key: "AzureDevOpsScopingSearchResults_userStories") {
                  error {
                    message
                  }
                  edges {
                    cursor
                    node {
                      title
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
  const userStories = azureDevOps?.userStories ?? null
  const edges = userStories?.edges ?? null
  const error = userStories?.error ?? null
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
    <ResultScroller>
      {edges.map(({node}) => {
        return (
          <ScopingSearchResultItem
            key={node.id}
            service={'azureDevOps'}
            usedServiceTaskIds={usedServiceTaskIds}
            serviceTaskId={'dev.azure.com/jacobsrj:2649cbcf-37c1-484d-a290-1409d9d5b1cf:' + node.id}
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
