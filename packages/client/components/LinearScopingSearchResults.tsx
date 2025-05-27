import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {PreloadedQuery, useFragment, usePaginationFragment, usePreloadedQuery} from 'react-relay'
import MockScopingList from '~/modules/meeting/components/MockScopingList'
import {LinearScopingSearchResultsPaginationQuery} from '../__generated__/LinearScopingSearchResultsPaginationQuery.graphql'
import {LinearScopingSearchResultsQuery} from '../__generated__/LinearScopingSearchResultsQuery.graphql'
import {LinearScopingSearchResults_meeting$key} from '../__generated__/LinearScopingSearchResults_meeting.graphql'
import {LinearScopingSearchResults_query$key} from '../__generated__/LinearScopingSearchResults_query.graphql'
import useGetUsedServiceTaskIds from '../hooks/useGetUsedServiceTaskIds'
import useLoadNextOnScrollBottom from '../hooks/useLoadNextOnScrollBottom'
import LinearIssueId from '../shared/gqlIds/LinearIssueId'
import LinearProjectId from '../shared/gqlIds/LinearProjectId'
import {GQLType} from '../types/generics'
import {getLinearRepoName} from '../utils/getLinearRepoName'
import getNonNullEdges from '../utils/getNonNullEdges'
import Ellipsis from './Ellipsis/Ellipsis'
import IntegrationScopingNoResults from './IntegrationScopingNoResults'
import LinearScopingSelectAllIssues from './LinearScopingSelectAllIssues'
import NewIntegrationRecordButton from './NewIntegrationRecordButton'
import NewLinearIssueInput from './NewLinearIssueInput'
import ScopingSearchResultItem from './ScopingSearchResultItem'

interface Props {
  queryRef: PreloadedQuery<LinearScopingSearchResultsQuery>
  meetingRef: LinearScopingSearchResults_meeting$key
}

const LinearScopingSearchResults = (props: Props) => {
  const {queryRef, meetingRef} = props
  const query = usePreloadedQuery(
    graphql`
      query LinearScopingSearchResultsQuery($teamId: ID!, $filter: _xLinearIssueFilter) {
        ...LinearScopingSearchResults_query @arguments(filter: $filter)
        viewer {
          ...NewLinearIssueInput_viewer
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
                  selectedProjectsIds
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
        id
        teamId
        linearSearchQuery {
          queryString
          selectedProjectsIds
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
  const {id: meetingId, phases} = meeting
  const errors = linear?.api?.errors ?? null
  const nullableEdges = linear?.api?.query?.issues?.edges ?? null
  const issues = nullableEdges
    ? getNonNullEdges(nullableEdges)
        .filter((edge) => edge.node.__typename === '_xLinearIssue')
        .map(({node}) => node as GQLType<typeof node, '_xLinearIssue'>)
    : null
  const [isEditing, setIsEditing] = useState(false)
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
      <LinearScopingSelectAllIssues
        usedServiceTaskIds={usedServiceTaskIds}
        issuesRef={issues}
        meetingId={meetingId}
      />
      <div className='overflow-auto'>
        {query && (
          <NewLinearIssueInput
            isEditing={isEditing}
            meetingId={meeting.id}
            setIsEditing={setIsEditing}
            viewerRef={query.viewer}
          />
        )}
        {issues.map((node) => {
          const {id: issueId, identifier, title, project, team, url} = node
          const {id: projectId} = project ?? {id: undefined}
          const teamName = team?.displayName ?? ''

          const repoStr = getLinearRepoName(project, teamName)
          const linkText = `${identifier} ${repoStr}`
          const repoId = LinearProjectId.join(team?.id ?? 'unknown-team-id', projectId)
          const serviceTaskId = LinearIssueId.join(repoId, issueId)
          return (
            <ScopingSearchResultItem
              key={issueId}
              service={'linear'}
              usedServiceTaskIds={usedServiceTaskIds}
              serviceTaskId={serviceTaskId}
              meetingId={meetingId}
              summary={title}
              url={url}
              linkText={linkText}
              linkTitle={linkText}
            />
          )
        })}
        {lastItem}
        {hasNext && (
          <div className='flex h-8 w-full justify-center text-2xl' key={'loadingNext'}>
            <Ellipsis />
          </div>
        )}
      </div>
      {!isEditing && (
        <NewIntegrationRecordButton onClick={handleAddIssueClick} labelText={'New Issue'} />
      )}
    </>
  )
}

export default LinearScopingSearchResults
