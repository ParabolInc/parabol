import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {PreloadedQuery, useFragment, usePaginationFragment, usePreloadedQuery} from 'react-relay'
import useGetUsedServiceTaskIds from '~/hooks/useGetUsedServiceTaskIds'
import MockScopingList from '~/modules/meeting/components/MockScopingList'
import useAtmosphere from '../hooks/useAtmosphere'
import useLoadNextOnScrollBottom from '../hooks/useLoadNextOnScrollBottom'
import PersistJiraServerSearchQueryMutation from '../mutations/PersistJiraServerSearchQueryMutation'
import {JiraServerScopingSearchResultsPaginationQuery} from '../__generated__/JiraServerScopingSearchResultsPaginationQuery.graphql'
import {JiraServerScopingSearchResultsQuery} from '../__generated__/JiraServerScopingSearchResultsQuery.graphql'
import {JiraServerScopingSearchResults_meeting$key} from '../__generated__/JiraServerScopingSearchResults_meeting.graphql'
import {JiraServerScopingSearchResults_query$key} from '../__generated__/JiraServerScopingSearchResults_query.graphql'
import Ellipsis from './Ellipsis/Ellipsis'
import IntegrationScopingNoResults from './IntegrationScopingNoResults'
import NewIntegrationRecordButton from './NewIntegrationRecordButton'
import ScopingSearchResultItem from './ScopingSearchResultItem'

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
  meetingRef: JiraServerScopingSearchResults_meeting$key
  queryRef: PreloadedQuery<JiraServerScopingSearchResultsQuery>
}

const JiraServerScopingSearchResults = (props: Props) => {
  const {meetingRef} = props

  const {t} = useTranslation()

  const {queryRef} = props
  const atmosphere = useAtmosphere()

  const query = usePreloadedQuery(
    graphql`
      query JiraServerScopingSearchResultsQuery(
        $teamId: ID!
        $queryString: String
        $isJQL: Boolean!
        $projectKeyFilters: [ID!]
      ) {
        ...JiraServerScopingSearchResults_query
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
              }
            }
          }
        }
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
  )

  const paginationRes = usePaginationFragment<
    JiraServerScopingSearchResultsPaginationQuery,
    JiraServerScopingSearchResults_query$key
  >(
    graphql`
      fragment JiraServerScopingSearchResults_query on Query
      @argumentDefinitions(first: {type: "Int", defaultValue: 25}, after: {type: "String"})
      @refetchable(queryName: "JiraServerScopingSearchResultsPaginationQuery") {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              jiraServer {
                issues(
                  first: $first
                  after: $after
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
    query
  )

  const lastItem = useLoadNextOnScrollBottom(paginationRes, {}, 20)
  const {data, hasNext} = paginationRes

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

  const viewer = data.viewer
  const {jiraServerSearchQuery, teamId} = meeting
  const issues = viewer?.teamMember!.integrations.jiraServer?.issues ?? null
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
        <IntegrationScopingNoResults
          error={error?.message}
          msg={t('JiraServerScopingSearchResults.NoIssuesMatchThatQuery')}
        />
        <NewIntegrationRecordButton
          onClick={handleAddIssueClick}
          labelText={t('JiraServerScopingSearchResults.NewIssue')}
        />
      </>
    )
  }

  const persistQuery = () => {
    const {queryString, isJQL} = jiraServerSearchQuery
    const jiraServer = query?.viewer.teamMember?.integrations.jiraServer
    const providerId = jiraServer?.providerId ?? null
    const searchQueries = jiraServer?.searchQueries ?? []
    // don't persist an empty string (the default)
    if (!queryString.trim()) return
    const projectKeyFilters = [...(jiraServerSearchQuery.projectKeyFilters as string[])].sort()
    const lookupKey = JSON.stringify({queryString, projectKeyFilters})
    const isQueryNew = !searchQueries.find(({queryString, projectKeyFilters}) => {
      return JSON.stringify({queryString, projectKeyFilters}) === lookupKey
    })

    if (isQueryNew) {
      PersistJiraServerSearchQueryMutation(atmosphere, {
        teamId,
        providerId,
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
            service={t('JiraServerScopingSearchResults.Jiraserver')}
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
      {lastItem}
      {hasNext && (
        <LoadingNext key={t('JiraServerScopingSearchResults.Loadingnext')}>
          <Ellipsis />
        </LoadingNext>
      )}
    </ResultScroller>
  )
}

export default JiraServerScopingSearchResults
