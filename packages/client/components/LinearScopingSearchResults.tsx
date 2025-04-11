import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {PreloadedQuery, useFragment, usePaginationFragment, usePreloadedQuery} from 'react-relay'
import MockScopingList from '~/modules/meeting/components/MockScopingList'
import {LinearScopingSearchResultsPaginationQuery} from '../__generated__/LinearScopingSearchResultsPaginationQuery.graphql'
import {LinearScopingSearchResultsQuery} from '../__generated__/LinearScopingSearchResultsQuery.graphql'
import {LinearScopingSearchResults_meeting$key} from '../__generated__/LinearScopingSearchResults_meeting.graphql'
import {LinearScopingSearchResults_query$key} from '../__generated__/LinearScopingSearchResults_query.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useGetUsedServiceTaskIds from '../hooks/useGetUsedServiceTaskIds'
import useLoadNextOnScrollBottom from '../hooks/useLoadNextOnScrollBottom'
// import PersistGitHubSearchQueryMutation from '../mutations/PersistGitHubSearchQueryMutation'
import LinearIssueId from '../shared/gqlIds/LinearIssueId'
import LinearProjectId from '../shared/gqlIds/LinearProjectId'
import {SprintPokerDefaults} from '../types/constEnums'
import {GQLType} from '../types/generics'
import getNonNullEdges from '../utils/getNonNullEdges'
import Ellipsis from './Ellipsis/Ellipsis'
import IntegrationScopingNoResults from './IntegrationScopingNoResults'
import LinearScopingSelectAllIssues from './LinearScopingSelectAllIssues'
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
  queryRef: PreloadedQuery<LinearScopingSearchResultsQuery>
  meetingRef: LinearScopingSearchResults_meeting$key
}

const LinearScopingSearchResults = (props: Props) => {
  const {queryRef, meetingRef} = props
  const query = usePreloadedQuery(
    graphql`
      query LinearScopingSearchResultsQuery($teamId: ID!) {
        ...LinearScopingSearchResults_query
        viewer {
          # ...NewLinearIssueInput_viewer
          teamMember(teamId: $teamId) {
            repoIntegrations(first: 20, networkOnly: false) {
              items {
                ... on _xLinearTeam {
                  id
                  displayName
                }
                ... on _xLinearProject {
                  id
                  teams(first: 1) {
                    nodes {
                      id
                      name
                    }
                  }
                }
              }
            }
            integrations {
              linear {
                linearSearchQueries {
                  queryString
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  )

  const paginationRes = usePaginationFragment<
    LinearScopingSearchResultsPaginationQuery,
    LinearScopingSearchResults_query$key
  >(
    graphql`
      fragment LinearScopingSearchResults_query on Query
      @argumentDefinitions(
        cursor: {type: "String"}
        count: {type: "Int", defaultValue: 25}
        filter: {
          type: "_xLinearIssueFilter"
          defaultValue: {description: {contains: "integrations"}}
        }
      )
      @refetchable(queryName: "LinearScopingSearchResultsPaginationQuery") {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              linear {
                api {
                  errors {
                    message
                    locations {
                      line
                      column
                    }
                    path
                  }
                  query {
                    issues(first: $count, after: $cursor, filter: $filter)
                      @connection(key: "LinearScopingSearchResults_issues") {
                      edges {
                        node {
                          __typename
                          ... on _xLinearIssue {
                            ...LinearScopingSelectAllIssues_issues
                            id
                            identifier
                            title
                            project {
                              id
                              name
                            }
                            team {
                              id
                              displayName
                            }
                            url
                          }
                        }
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
      fragment LinearScopingSearchResults_meeting on PokerMeeting {
        # ...NewLinearIssueInput_meeting
        id
        teamId
        linearSearchQuery {
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
  const {viewer} = data
  const teamMember = viewer.teamMember!
  const {integrations} = teamMember
  const {linear} = integrations
  const {id: meetingId, linearSearchQuery, teamId, phases} = meeting
  const {queryString} = linearSearchQuery
  const errors = linear?.api?.errors ?? null
  const nullableEdges = linear?.api?.query?.issues?.edges ?? null
  const issues = nullableEdges
    ? getNonNullEdges(nullableEdges)
        .filter((edge) => edge.node.__typename === '_xLinearIssue')
        .map(({node}) => node as GQLType<typeof node, '_xLinearIssue'>)
    : null
  const [isEditing, setIsEditing] = useState(false)
  const atmosphere = useAtmosphere()
  const estimatePhase = phases.find(({phaseType}) => phaseType === 'ESTIMATE')!
  const usedServiceTaskIds = useGetUsedServiceTaskIds(estimatePhase)
  const handleAddIssueClick = () => setIsEditing(true)

  // even though it's a little herky jerky, we need to give the user feedback that a search is pending
  // TODO fix flicker after viewer is present but edges isn't set
  if (!issues) return <MockScopingList />
  if (issues.length === 0 && !isEditing) {
    return (
      <>
        <IntegrationScopingNoResults
          error={errors?.[0]?.message}
          msg={'No issues match that query'}
        />
        {/* <NewIntegrationRecordButton onClick={handleAddIssueClick} labelText={'New Issue'} /> */}
      </>
    )
  }
  const persistQuery = () => {
    // don't persist empty
    if (!queryString) return
    const normalizedQueryString = queryString.toLowerCase().trim()
    // don't persist default
    if (normalizedQueryString === SprintPokerDefaults.LINEAR_DEFAULT_QUERY) return
    const linearSearchQueries =
      query.viewer.teamMember?.integrations.linear?.linearSearchQueries ?? []
    const searchHashes = linearSearchQueries.map(({queryString}) => queryString)
    const isQueryNew = !searchHashes.includes(normalizedQueryString)
    // if (isQueryNew) {
    //   PersistGitHubSearchQueryMutation(atmosphere, {
    //     teamId,
    //     queryString: normalizedQueryString
    //   })
    // }
  }
  return (
    <>
      <LinearScopingSelectAllIssues
        usedServiceTaskIds={usedServiceTaskIds}
        issuesRef={issues}
        meetingId={meetingId}
      />
      <ResultScroller>
        {/* {query && (
          <NewLinearIssueInput
            isEditing={isEditing}
            meetingRef={meeting}
            setIsEditing={setIsEditing}
            viewerRef={query.viewer}
          />
        )} */}
        {issues.map((node) => {
          const {
            id: issueId,
            identifier,
            title,
            project,
            team: {id: teamId, displayName: teamName},
            url
          } = node
          const {id: projectId, name: projectName} = project ?? {
            id: undefined,
            projectName: undefined
          }
          const repoId = LinearProjectId.join(teamId, projectId)
          const serviceTaskId = LinearIssueId.join(repoId, issueId)
          const repoStr = projectName ? `${teamName}/${projectName}` : teamName
          const linkText = `${identifier} ${repoStr}`
          return (
            <ScopingSearchResultItem
              key={issueId}
              service={'linear'}
              usedServiceTaskIds={usedServiceTaskIds}
              serviceTaskId={serviceTaskId}
              meetingId={meetingId}
              persistQuery={persistQuery}
              summary={title}
              url={url}
              linkText={linkText}
              linkTitle={linkText}
            />
          )
        })}
        {lastItem}
        {hasNext && (
          <LoadingNext key={'loadingNext'}>
            <Ellipsis />
          </LoadingNext>
        )}
      </ResultScroller>
      {/* {!isEditing && (
        <NewIntegrationRecordButton onClick={handleAddIssueClick} labelText={'New Issue'} />
      )} */}
    </>
  )
}

export default LinearScopingSearchResults
