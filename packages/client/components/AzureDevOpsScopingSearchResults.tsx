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
      query AzureDevOpsScopingSearchResultsQuery($teamId: ID!, $first: Int) {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              azureDevOps {
                userStories(first: $first)
                  @connection(key: "AzureDevOpsScopingSearchResults_userStories") {
                  error {
                    message
                  }
                  edges {
                    cursor
                    node {
                      id
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
  console.log(`AzureDevOpsScopingSearchResults.viewer: ${JSON.stringify(viewer)}`)
  const azureDevOps = viewer?.teamMember!.integrations.azureDevOps ?? null
  console.log(`AzureDevOpsScopingSearchResults.azureDevOps: ${JSON.stringify(azureDevOps)} `)
  const userStories = azureDevOps?.userStories ?? null
  console.log(`userStories: ${JSON.stringify(userStories)}`)
  const edges = userStories?.edges ?? null
  console.log(`edges: ${JSON.stringify(edges)}`)
  const error = userStories?.error ?? null
  console.log(`error: ${error}`)
  const [isEditing, setIsEditing] = useState(false)
  const {id: meetingId, phases} = meeting
  const estimatePhase = phases.find(({phaseType}) => phaseType === 'ESTIMATE')!
  const usedServiceTaskIds = useGetUsedServiceTaskIds(estimatePhase)
  const handleAddIssueClick = () => setIsEditing(true)

  if (!edges) {
    console.log(`no edge`)
    return <MockScopingList />
  }
  if (edges.length === 0 && !isEditing) {
    console.log(`IntegrationScopingNoResults`)
    return (
      <>
        <IntegrationScopingNoResults error={error?.message} msg={'No issues match that query'} />
        <NewIntegrationRecordButton onClick={handleAddIssueClick} labelText={'New User Story'} />
      </>
    )
  }
  console.log(`returning ResultsScroller`)
  return (
    <ResultScroller>
      {edges.map(({node}) => {
        console.log(`node is ${JSON.stringify(node)}`)
        return (
          <ScopingSearchResultItem
            key={node.id}
            service={'azureDevOps'}
            usedServiceTaskIds={usedServiceTaskIds}
            serviceTaskId={node.id}
            meetingId={meetingId}
            persistQuery={() => {
              return null
            }}
            summary={node.state}
            url={node.url}
            linkText={node.type}
            linkTitle={`Azure DevOps Work Item #${node.id}`}
          />
        )
      })}
    </ResultScroller>
  )
}

export default AzureDevOpsScopingSearchResults
