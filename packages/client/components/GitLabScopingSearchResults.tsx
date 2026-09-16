import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {
  type PreloadedQuery,
  useFragment,
  usePaginationFragment,
  usePreloadedQuery
} from 'react-relay'
import useGetUsedServiceTaskIds from '~/hooks/useGetUsedServiceTaskIds'
import useLoadNextOnScrollBottom from '~/hooks/useLoadNextOnScrollBottom'
import MockScopingList from '~/modules/meeting/components/MockScopingList'
import type {GitLabScopingSearchResults_meeting$key} from '../__generated__/GitLabScopingSearchResults_meeting.graphql'
import type {GitLabScopingSearchResults_query$key} from '../__generated__/GitLabScopingSearchResults_query.graphql'
import type {GitLabScopingSearchResultsPaginationQuery} from '../__generated__/GitLabScopingSearchResultsPaginationQuery.graphql'
import type {GitLabScopingSearchResultsQuery} from '../__generated__/GitLabScopingSearchResultsQuery.graphql'
import findIntegrationService from '../integrations/platform/findIntegrationService'
import GitLabIssueId from '../shared/gqlIds/GitLabIssueId'
import type {GQLType} from '../types/generics'
import getNonNullEdges from '../utils/getNonNullEdges'
import {parseWebPath} from '../utils/parseWebPath'
import Ellipsis from './Ellipsis/Ellipsis'
import GitLabScopingSelectAllIssues from './GitLabScopingSelectAllIssues'
import IntegrationScopingNoResults from './IntegrationScopingNoResults'
import NewGitLabIssueInput from './NewGitLabIssueInput'
import NewIntegrationRecordButton from './NewIntegrationRecordButton'
import ScopingSearchResultItem from './ScopingSearchResultItem'

interface Props {
  queryRef: PreloadedQuery<GitLabScopingSearchResultsQuery>
  meetingRef: GitLabScopingSearchResults_meeting$key
}

const GitLabScopingSearchResults = (props: Props) => {
  const {queryRef, meetingRef} = props

  const query = usePreloadedQuery<GitLabScopingSearchResultsQuery>(
    graphql`
      query GitLabScopingSearchResultsQuery(
        $teamId: ID!
        $queryString: String!
        $selectedProjectsIds: [String!]
        $sort: String!
        $state: String!
      ) {
        ...GitLabScopingSearchResults_query
        viewer {
          ...NewGitLabIssueInput_viewer
          teamMember(teamId: $teamId) {
            services {
              ...findIntegrationService_auth @relay(mask: false)
            }
          }
        }
      }
    `,
    queryRef
  )

  const paginationRes = usePaginationFragment<
    GitLabScopingSearchResultsPaginationQuery,
    GitLabScopingSearchResults_query$key
  >(
    graphql`
      fragment GitLabScopingSearchResults_query on Query
      @argumentDefinitions(cursor: {type: "String"}, count: {type: "Int", defaultValue: 25})
      @refetchable(queryName: "GitLabScopingSearchResultsPaginationQuery") {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              gitlab {
                projectsIssues(
                  projectsIds: $selectedProjectsIds
                  first: $count
                  after: $cursor
                  searchQuery: $queryString
                  state: $state
                  sort: $sort
                ) @connection(key: "GitLabScopingSearchResults_projectsIssues") {
                  error {
                    message
                  }
                  edges {
                    node {
                      __typename
                      ... on _xGitLabIssue {
                        ...GitLabScopingSelectAllIssues_issues @alias
                        id
                        iid
                        title
                        webPath
                        webUrl
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
  const lastItem = useLoadNextOnScrollBottom(paginationRes, {}, 25)
  const {hasNext, data} = paginationRes
  const projectsIssues = data.viewer.teamMember?.integrations.gitlab.projectsIssues
  const nullableEdges = projectsIssues?.edges
  const errorMessage = projectsIssues?.error?.message ?? null

  const meeting = useFragment(
    graphql`
      fragment GitLabScopingSearchResults_meeting on PokerMeeting {
        id
        teamId
        phases {
          ...useGetUsedServiceTaskIds_phase @alias
          phaseType
        }
      }
    `,
    meetingRef
  )
  const {viewer} = query
  const providerId =
    findIntegrationService(viewer.teamMember?.services ?? [], 'gitlab')?.auth?.providerId ?? ''
  const {id: meetingId, phases} = meeting
  const issues = nullableEdges
    ? getNonNullEdges(nullableEdges)
        .filter((edge) => edge.node.__typename === '_xGitLabIssue')
        .map(({node}) => node as GQLType<typeof node, '_xGitLabIssue'>)
    : null
  const [isEditing, setIsEditing] = useState(false)
  const estimatePhase = phases.find(({phaseType}) => phaseType === 'ESTIMATE')!
  const usedServiceTaskIds = useGetUsedServiceTaskIds(estimatePhase.useGetUsedServiceTaskIds_phase)
  const handleAddIssueClick = () => setIsEditing(true)

  if (!issues) return <MockScopingList />
  if (issues.length === 0 && !isEditing) {
    return (
      <>
        <IntegrationScopingNoResults error={errorMessage} msg={'No issues match that query'} />
        <NewIntegrationRecordButton onClick={handleAddIssueClick} labelText={'New Issue'} />
      </>
    )
  }
  return (
    <>
      <GitLabScopingSelectAllIssues
        usedServiceTaskIds={usedServiceTaskIds}
        issuesRef={
          issues?.flatMap(({GitLabScopingSelectAllIssues_issues: issue}) =>
            issue ? [issue] : []
          ) ?? null
        }
        meetingId={meetingId}
        providerId={providerId}
      />
      <div className='overflow-auto'>
        {query && (
          <NewGitLabIssueInput
            isEditing={isEditing}
            meetingId={meetingId}
            setIsEditing={setIsEditing}
            viewerRef={viewer}
          />
        )}
        {issues.map((issue) => {
          const {id, iid, title, webUrl, webPath} = issue
          const {fullPath} = parseWebPath(webPath)
          const linkText = `#${iid} ${fullPath}`

          return (
            <ScopingSearchResultItem
              key={id}
              service={'gitlab'}
              usedServiceTaskIds={usedServiceTaskIds}
              serviceTaskId={GitLabIssueId.join(providerId, id)}
              meetingId={meetingId}
              summary={title}
              url={webUrl}
              linkText={linkText}
              linkTitle={linkText}
            />
          )
        })}
        {lastItem}
        {hasNext && (
          <div className='flex h-8 w-full justify-center text-[24px]' key={'loadingNext'}>
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

export default GitLabScopingSearchResults
