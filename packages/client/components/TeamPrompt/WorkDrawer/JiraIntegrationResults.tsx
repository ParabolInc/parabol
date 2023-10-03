import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import {JiraIntegrationResultsQuery} from '../../../__generated__/JiraIntegrationResultsQuery.graphql'
import {JiraIntegrationResults_search$data} from '../../../__generated__/JiraIntegrationResults_search.graphql'
import halloweenRetrospectiveTemplate from '../../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
import JiraObjectCard from './JiraObjectCard'

interface Props {
  queryRef: PreloadedQuery<JiraIntegrationResultsQuery>
}

const JiraIntegrationResults = (props: Props) => {
  const {queryRef} = props
  const query = usePreloadedQuery(
    graphql`
      query JiraIntegrationResultsQuery($teamId: ID!) {
        ...JiraIntegrationResults_search @arguments(teamId: $teamId)
      }
    `,
    queryRef
  )

  const queryFrag = useFragment(
    graphql`
      fragment JiraIntegrationResults_search on Query @argumentDefinitions(teamId: {type: "ID!"}) {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              atlassian {
                issues(
                  first: 20
                  isJQL: true
                  queryString: "assignee = currentUser() order by updated DESC"
                ) @connection(key: "JiraScopingSearchResults_issues") {
                  error {
                    message
                  }
                  edges {
                    node {
                      ...JiraObjectCard_result
                      id
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
    `,
    query
  )

  const jira = (queryFrag as JiraIntegrationResults_search$data).viewer.teamMember?.integrations
    .atlassian

  const jiraResults = jira?.issues.edges.map((edge) => edge.node)
  const error = jira?.issues.error ?? null

  return (
    <>
      <div className='flex flex h-full flex-col gap-y-2 overflow-auto p-4'>
        {jiraResults && jiraResults.length > 0 ? (
          jiraResults?.map((result, idx) => {
            if (!result) {
              return null
            }
            return <JiraObjectCard key={idx} resultRef={result} />
          })
        ) : (
          <div className='-mt-14 flex h-full flex-col items-center justify-center'>
            <img className='w-20' src={halloweenRetrospectiveTemplate} />
            <div className='mt-7 w-2/3 text-center'>
              {error?.message ? error.message : `Looks like you don’t have any issues to display.`}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default JiraIntegrationResults
