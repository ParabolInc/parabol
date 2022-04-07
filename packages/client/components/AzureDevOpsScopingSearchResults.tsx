import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React,{ useState } from 'react'
import { PreloadedQuery,useFragment,usePaginationFragment,usePreloadedQuery } from 'react-relay'
import useGetUsedServiceTaskIds from '~/hooks/useGetUsedServiceTaskIds'
import useLoadNextOnScrollBottom from '~/hooks/useLoadNextOnScrollBottom'
import MockScopingList from '~/modules/meeting/components/MockScopingList'
// import {AzureDevOpsScopingSearchResultsRoot_meeting$key} from '~/__generated__/AzureDevOpsScopingSearchResultsRoot_meeting.graphql'
// import useAtmosphere from '../hooks/useAtmosphere'
// import useGetUsedServiceTaskIds from '../hooks/useGetUsedServiceTaskIds'
// import useLoadNextOnScrollBottom from '../hooks/useLoadNextOnScrollBottom'
// import PersistAzureDevOpsSearchQueryMutation from '../mutations/PersistAzureDevOpsSearchQueryMutation'
// import {SprintPokerDefaults} from '../types/constEnums'
import { AzureDevOpsScopingSearchResultsPaginationQuery } from '../__generated__/AzureDevOpsScopingSearchResultsPaginationQuery.graphql'
import { AzureDevOpsScopingSearchResultsQuery } from '../__generated__/AzureDevOpsScopingSearchResultsQuery.graphql'
import { AzureDevOpsScopingSearchResults_meeting$key } from '../__generated__/AzureDevOpsScopingSearchResults_meeting.graphql'
import { AzureDevOpsScopingSearchResults_query$key } from '../__generated__/AzureDevOpsScopingSearchResults_query.graphql'
// import Ellipsis from './Ellipsis/Ellipsis'
import AzureDevOpsScopingSearchResultItem from './AzureDevOpsScopingSearchResultItem'
import AzureDevOpsScopingSelectAllIssues from './AzureDevOpsScopingSelectAllIssues'
import Ellipsis from './Ellipsis/Ellipsis'
import IntegrationScopingNoResults from './IntegrationScopingNoResults'
// import NewAzureDevOpsIssueInput from './NewAzureDevOpsIssueInput'
import NewIntegrationRecordButton from './NewIntegrationRecordButton'

const ResultScroller = styled('div')({
  overflow: 'auto'
})

const LoadingNext = styled('div')({
  display: 'flex',
  height: 32,
  fontSize: 24,
  justifyContent: 'center',
  width: '100%'
})

interface Props {
  queryRef: PreloadedQuery<AzureDevOpsScopingSearchResultsQuery>
  meetingRef: AzureDevOpsScopingSearchResults_meeting$key
}

const AzureDevOpsScopingSearchResults = (props: Props) => {
  const {queryRef, meetingRef} = props
  const query = usePreloadedQuery(
    graphql`
      query AzureDevOpsScopingSearchResultsQuery($teamId: ID!) {
        ...AzureDevOpsScopingSearchResults_query
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
  )

  const paginationRes = usePaginationFragment<
    AzureDevOpsScopingSearchResultsPaginationQuery,
    AzureDevOpsScopingSearchResults_query$key
  >(
    graphql`
      fragment AzureDevOpsScopingSearchResults_query on Query
      @refetchable(queryName: "AzureDevOpsScopingSearchResultsPaginationQuery") {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              azureDevOps {
                auth {
                  provider {
                    id
                  }
                }
                userStories(first: $first, after: $after)
                  @connection(key: "AzureDevOpsScopingSearchResults_issues") {
                  error {
                    message
                  }
                  edges {
                    cursor
                    ...AzureDevOpsScopingSelectAllIssues_issues
                    node {
                      id
                      url
                      state
                      type
                      ...AzureDevOpsScopingSearchResultItem_issue
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    query
  )

  const lastItem = useLoadNextOnScrollBottom(paginationRes, {}, 20)
  const {data, hasNext, /*loadNext*/} = paginationRes
  const {viewer} = data
  const meeting = useFragment(
    graphql`
      fragment AzureDevOpsScopingSearchResults_meeting on PokerMeeting {
        # ...NewAzureDevOpsIssueInput_meeting
        id
        teamId
        # azureDevOpsSearchQuery {
        #   queryString
        # }
        phases {
          ...useGetUsedServiceTaskIds_phase
          phaseType
        }
      }
    `,
    meetingRef
  )
  const teamMember = viewer.teamMember!
  const {integrations} = teamMember
  const {azureDevOps} = integrations
  const {id: meetingId, phases} = meeting
  // const {queryString} = azureDevOpsSearchQuery
  const providerId = azureDevOps.auth!.provider.id
  const issues = azureDevOps?.workItems ?? null
  const errors = issues?.error ?? null
  const [isEditing, setIsEditing] = useState(false)
  //const atmosphere = useAtmosphere()
  const estimatePhase = phases.find(({phaseType}) => phaseType === 'ESTIMATE')!
  const usedServiceTaskIds = useGetUsedServiceTaskIds(estimatePhase)
  const handleAddIssueClick = () => setIsEditing(true)

  if (!issues) return <MockScopingList />
  if (issues.length === 0 && !isEditing) {
    return (
      <>
        <IntegrationScopingNoResults
          error={errors?.[0]?.message}
          msg={'No issues match that query'}
        />
        <NewIntegrationRecordButton onClick={handleAddIssueClick} labelText={'New Issue'} />
      </>
    )
  }
  return (
    <>
      <AzureDevOpsScopingSelectAllIssues
        usedServiceTaskIds={usedServiceTaskIds}
        issuesRef={issues}
        meetingId={meetingId}
        providerId={providerId}
      />
      <ResultScroller>
        {/* {query && (
          <NewAzureDevOpsIssueInput
            isEditing={isEditing}
            meetingRef={meeting}
            setIsEditing={setIsEditing}
            viewerRef={query.viewer}
          />
        )} */}
        {issues.map((issue) => (
          <AzureDevOpsScopingSearchResultItem
            key={issue.id}
            issueRef={issue}
            meetingId={meetingId}
            usedServiceTaskIds={usedServiceTaskIds}
            providerId={providerId}
            // persistQuery={persistQuery}
          />
        ))}
        {lastItem}
        {hasNext && (
          <LoadingNext key={'loadingNext'}>
            <Ellipsis />
          </LoadingNext>
        )}
      </ResultScroller>
      {!isEditing && (
        <NewIntegrationRecordButton onClick={handleAddIssueClick} labelText={'New Issue'} />
      )}
    </>
  )
}

export default AzureDevOpsScopingSearchResults
