import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import MockScopingList from '~/modules/meeting/components/MockScopingList'
// import useAtmosphere from '../hooks/useAtmosphere'
// import useGetUsedServiceTaskIds from '../hooks/useGetUsedServiceTaskIds'
// import useLoadNextOnScrollBottom from '../hooks/useLoadNextOnScrollBottom'
// import PersistGitLabSearchQueryMutation from '../mutations/PersistGitLabSearchQueryMutation'
// import {SprintPokerDefaults} from '../types/constEnums'
import {GQLType} from '../types/generics'
import getNonNullEdges from '../utils/getNonNullEdges'
// import {gitHubQueryValidation} from '../validation/gitHubQueryValidation'
// import {GitLabScopingSearchResultsPaginationQuery} from '../__generated__/GitLabScopingSearchResultsPaginationQuery.graphql'
import {GitLabScopingSearchResultsQuery} from '../__generated__/GitLabScopingSearchResultsQuery.graphql'
// import {GitLabScopingSearchResults_meeting$key} from '../__generated__/GitLabScopingSearchResults_meeting.graphql'
// import {GitLabScopingSearchResults_query$key} from '../__generated__/GitLabScopingSearchResults_query.graphql'
// import Ellipsis from './Ellipsis/Ellipsis'
// import GitLabScopingSearchResultItem from './GitLabScopingSearchResultItem'
// import GitLabScopingSelectAllIssues from './GitLabScopingSelectAllIssues'
// import IntegrationScopingNoResults from './IntegrationScopingNoResults'
// import NewGitLabIssueInput from './NewGitLabIssueInput'
// import NewIntegrationRecordButton from './NewIntegrationRecordButton'

const ResultScroller = styled('div')({
  overflow: 'auto'
})

// const LoadingNext = styled('div')({
//   display: 'flex',
//   height: 32,
//   fontSize: 24,
//   justifyContent: 'center',
//   width: '100%'
// })

interface Props {
  queryRef: PreloadedQuery<GitLabScopingSearchResultsQuery>
  // meetingRef: GitLabScopingSearchResults_meeting$key
}

const GitLabScopingSearchResults = (props: Props) => {
  const {queryRef} = props
  const query = usePreloadedQuery(
    graphql`
      query GitLabScopingSearchResultsQuery($teamId: ID!) {
        ...GitLabScopingSearchResults_query
        viewer {
          id
          # ...NewGitLabIssueInput_viewer
          # teamMember(teamId: $teamId) {
          #   suggestedIntegrations {
          #     items {
          #       # ... on SuggestedIntegrationGitLab {
          #       #   id
          #       #   nameWithOwner
          #       # }
          #     }
          #   }
          #   integrations {
          #     gitlab {
          #       gitlabSearchQueries {
          #         queryString
          #       }
          #     }
          #   }
          # }
        }
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
  )

  // const paginationRes = usePaginationFragment<
  //   GitLabScopingSearchResultsPaginationQuery,
  //   GitLabScopingSearchResults_query$key
  // >(
  // # @refetchable(queryName: "GitLabScopingSearchResultsPaginationQuery") {
  // # @argumentDefinitions(cursor: {type: "String"}, count: {type: "Int", defaultValue: 25})
  const paginationRes = useFragment(
    graphql`
      fragment GitLabScopingSearchResults_query on Query {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              gitlab {
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
                    projects(membership: true) {
                      edges {
                        node {
                          issues {
                            edges {
                              node {
                                __typename
                                id
                                title
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
        }
      }
    `,
    query
  ) as any
  // const lastItem = useLoadNextOnScrollBottom(paginationRes, {}, 20)
  // const {data, hasNext} = paginationRes
  const {viewer} = paginationRes
  // const meeting = useFragment(
  //   graphql`
  //     fragment GitLabScopingSearchResults_meeting on PokerMeeting {
  //       # ...NewGitLabIssueInput_meeting
  //       id
  //       teamId
  //       # gitlabSearchQuery {
  //       #   queryString
  //       # }
  //       phases {
  //         # ...useGetUsedServiceTaskIds_phase
  //         phaseType
  //       }
  //     }
  //   `,
  //   meetingRef
  // )
  const teamMember = viewer.teamMember!
  const {integrations} = teamMember
  const {gitlab} = integrations
  // const {id: meetingId, gitlabSearchQuery, teamId, phases} = meeting
  // const {phases} = meeting
  // const {queryString} = gitlabSearchQuery
  // const errors = gitlab?.api?.errors ?? null
  const nullableEdges =
    gitlab?.api?.query?.projects?.edges.flatMap((project) => project.node.issues.edges) ?? null
  // const projectEdges = getNonNullEdges(nullableProjectEdges)
  // const nullableIssueEdges = projectEdges?.flatMap((edge) => edge.node.issues.edges)
  const issues = nullableEdges
    ? getNonNullEdges(nullableEdges)
        .filter((edge) => edge.node.__typename === '_xGitLabIssue')
        .map(({node}) => node as GQLType<typeof node, '_xGitLabIssue'>)
    : null
  // const [isEditing, setIsEditing] = useState(false)
  // const atmosphere = useAtmosphere()
  // const estimatePhase = phases.find(({phaseType}) => phaseType === 'ESTIMATE')!
  // const usedServiceTaskIds = useGetUsedServiceTaskIds(estimatePhase)
  // const handleAddIssueClick = () => setIsEditing(true)

  // even though it's a little herky jerky, we need to give the user feedback that a search is pending
  // TODO fix flicker after viewer is present but edges isn't set
  if (!issues) return <MockScopingList />
  // if (issues.length === 0 && !isEditing) {
  //   const invalidQuery = gitHubQueryValidation(queryString)
  //   return (
  //     <>
  //       <IntegrationScopingNoResults
  //         error={invalidQuery || errors?.[0]?.message}
  //         msg={'No issues match that query'}
  //       />
  //       <NewIntegrationRecordButton onClick={handleAddIssueClick} labelText={'New Issue'} />
  //     </>
  //   )
  // }
  // const persistQuery = () => {
  //   // don't persist empty
  //   if (!queryString) return
  //   const normalizedQueryString = queryString.toLowerCase().trim()
  //   // don't persist default
  //   if (normalizedQueryString === SprintPokerDefaults.GITHUB_DEFAULT_QUERY) return
  //   const gitlabSearchQueries =
  //     query.viewer.teamMember?.integrations.gitlab?.gitlabSearchQueries ?? []
  //   const searchHashes = gitlabSearchQueries.map(({queryString}) => queryString)
  //   const isQueryNew = !searchHashes.includes(normalizedQueryString)
  //   if (isQueryNew) {
  //     PersistGitLabSearchQueryMutation(atmosphere, {
  //       teamId,
  //       queryString: normalizedQueryString
  //     })
  //   }
  // }
  return (
    <>
      {/* {
        <GitLabScopingSelectAllIssues
          usedServiceTaskIds={usedServiceTaskIds}
          issuesRef={issues}
          meetingId={meetingId}
        />
      } */}
      <ResultScroller>
        {/* {query && (
          <NewGitLabIssueInput
            isEditing={isEditing}
            meetingRef={meeting}
            setIsEditing={setIsEditing}
            viewerRef={query.viewer}
          />
        )} */}
        {issues.map((node) => {
          const {id, title} = node
          return <div key={id}>{title}</div>
          // return (
          //   <GitLabScopingSearchResultItem
          //     key={node.id}
          //     issue={node}
          //     usedServiceTaskIds={usedServiceTaskIds}
          //     meetingId={meetingId}
          //     // persistQuery={persistQuery}
          //   />
          // )
        })}
        {/* {lastItem} */}
        {/* {hasNext && (
          <LoadingNext key={'loadingNext'}>
            <Ellipsis />
          </LoadingNext>
        )} */}
      </ResultScroller>
      {/* {!isEditing && (
        <NewIntegrationRecordButton onClick={handleAddIssueClick} labelText={'New Issue'} />
      )} */}
    </>
  )
}

export default GitLabScopingSearchResults
