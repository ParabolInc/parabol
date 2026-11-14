import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Link} from 'react-router'
import halloweenRetrospectiveTemplate from '../../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
import type {AzureDevOpsIntegrationResultsQuery} from '../../../__generated__/AzureDevOpsIntegrationResultsQuery.graphql'
import AzureDevOpsObjectCard from './AzureDevOpsObjectCard'

interface Props {
  queryRef: PreloadedQuery<AzureDevOpsIntegrationResultsQuery>
  teamId: string
  searchQuery: string
  onResultCount: (searchQuery: string, count: number) => void
}

const AzureDevOpsIntegrationResults = (props: Props) => {
  const {queryRef, teamId, searchQuery, onResultCount} = props
  const data = usePreloadedQuery<AzureDevOpsIntegrationResultsQuery>(
    graphql`
      query AzureDevOpsIntegrationResultsQuery(
        $teamId: ID!
        $first: Int!
        $where: String!
        $projectIds: [String!]!
      ) {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              azureDevOps {
                workItems(
                  first: $first
                  queryString: $where
                  projectKeyFilters: $projectIds
                  isWIQL: true
                ) {
                  error {
                    message
                  }
                  edges {
                    node {
                      id
                      ...AzureDevOpsObjectCard_workItem
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
  const workItems = data.viewer.teamMember?.integrations.azureDevOps.workItems
  const edges = workItems?.edges ?? []
  const errorMessage = workItems?.error?.message

  // Report how many work items this search returned so the parent can hide the AI draft UI
  // when there's no work to draft from.
  const resultCount = edges.length
  useEffect(() => {
    onResultCount(searchQuery, resultCount)
  }, [searchQuery, resultCount, onResultCount])

  if (edges.length > 0) {
    return (
      <div className='flex flex-col gap-y-2 px-4 pb-4'>
        {edges.map(({node}) => (
          <AzureDevOpsObjectCard key={node.id} workItemRef={node} />
        ))}
      </div>
    )
  }
  return (
    <div className='flex flex-col items-center px-4 pt-12 text-center'>
      <img className='w-20' src={halloweenRetrospectiveTemplate} alt='' />
      <div className='mt-7 w-2/3 text-fg-secondary text-sm'>
        {errorMessage ?? 'Looks like no Azure DevOps work items match your filter.'}
      </div>
      <Link
        to={`/team/${teamId}/integrations`}
        className='mt-4 font-semibold text-accent hover:text-sky-400'
      >
        Review Azure DevOps integration settings
      </Link>
    </div>
  )
}

export default AzureDevOpsIntegrationResults
