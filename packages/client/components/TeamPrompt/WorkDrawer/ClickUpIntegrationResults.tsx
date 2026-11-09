import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {type PreloadedQuery, usePaginationFragment, usePreloadedQuery} from 'react-relay'
import {Link} from 'react-router'
import halloweenRetrospectiveTemplate from '../../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
import type {ClickUpIntegrationResults_query$key} from '../../../__generated__/ClickUpIntegrationResults_query.graphql'
import type {ClickUpIntegrationResultsPaginationQuery} from '../../../__generated__/ClickUpIntegrationResultsPaginationQuery.graphql'
import type {ClickUpIntegrationResultsQuery} from '../../../__generated__/ClickUpIntegrationResultsQuery.graphql'
import useLoadNextOnScrollBottom from '../../../hooks/useLoadNextOnScrollBottom'
import Ellipsis from '../../Ellipsis/Ellipsis'
import ClickUpObjectCard from './ClickUpObjectCard'

interface Props {
  queryRef: PreloadedQuery<ClickUpIntegrationResultsQuery>
  teamId: string
  searchQuery: string
  onResultCount: (searchQuery: string, count: number) => void
}

const ClickUpIntegrationResults = (props: Props) => {
  const {queryRef, teamId, searchQuery, onResultCount} = props
  const query = usePreloadedQuery<ClickUpIntegrationResultsQuery>(
    graphql`
      query ClickUpIntegrationResultsQuery(
        $teamId: ID!
        $listIds: [ID!]
        $updatedAfter: DateTime
        $updatedBefore: DateTime
      ) {
        ...ClickUpIntegrationResults_query
      }
    `,
    queryRef
  )
  const paginationRes = usePaginationFragment<
    ClickUpIntegrationResultsPaginationQuery,
    ClickUpIntegrationResults_query$key
  >(
    graphql`
      fragment ClickUpIntegrationResults_query on Query
      @argumentDefinitions(first: {type: "Int", defaultValue: 25}, after: {type: "String"})
      @refetchable(queryName: "ClickUpIntegrationResultsPaginationQuery") {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              clickup {
                tasks(
                  first: $first
                  after: $after
                  listIds: $listIds
                  assignedToViewer: true
                  includeClosed: true
                  updatedAfter: $updatedAfter
                  updatedBefore: $updatedBefore
                ) @connection(key: "ClickUpIntegrationResults_tasks") {
                  error {
                    message
                  }
                  edges {
                    node {
                      id
                      ...ClickUpObjectCard_task
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
  const {data, hasNext} = paginationRes
  const tasks = data.viewer.teamMember?.integrations.clickup.tasks
  const edges = tasks?.edges ?? []
  const errorMessage = tasks?.error?.message

  const resultCount = edges.length
  useEffect(() => {
    onResultCount(searchQuery, resultCount)
  }, [searchQuery, resultCount, onResultCount])

  if (edges.length === 0) {
    return (
      <div className='flex flex-col items-center px-4 pt-12 text-center'>
        <img className='w-20' src={halloweenRetrospectiveTemplate} alt='' />
        <div className='mt-7 w-2/3 text-fg-secondary text-sm'>
          {errorMessage ?? 'Looks like no ClickUp tasks assigned to you match your filter.'}
        </div>
        <Link
          to={`/team/${teamId}/integrations`}
          className='mt-4 font-semibold text-accent hover:text-sky-400'
        >
          Review ClickUp integration settings
        </Link>
      </div>
    )
  }
  return (
    <div className='flex flex-col gap-y-2 px-4 pb-4'>
      {edges.map(({node}) => (
        <ClickUpObjectCard key={node.id} taskRef={node} />
      ))}
      {lastItem}
      {hasNext && (
        <div className='-mt-4 mx-auto mb-4 h-8 text-2xl'>
          <Ellipsis />
        </div>
      )}
    </div>
  )
}

export default ClickUpIntegrationResults
