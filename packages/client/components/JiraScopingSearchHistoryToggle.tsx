import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import PersistJiraSearchQueryMutation from '../mutations/PersistJiraSearchQueryMutation'
import SearchQueryId from '../shared/gqlIds/SearchQueryId'
import {JiraScopingSearchHistoryToggle_meeting$key} from '../__generated__/JiraScopingSearchHistoryToggle_meeting.graphql'
import ScopingSearchHistoryToggle from './ScopingSearchHistoryToggle'

interface Props {
  meetingRef: JiraScopingSearchHistoryToggle_meeting$key
}

const JiraScopingSearchHistoryToggle = (props: Props) => {
  const {meetingRef} = props
  const atmosphere = useAtmosphere()
  const meeting = useFragment(
    graphql`
      fragment JiraScopingSearchHistoryToggle_meeting on PokerMeeting {
        id
        teamId
        viewerMeetingMember {
          teamMember {
            integrations {
              atlassian {
                jiraSearchQueries {
                  id
                  queryString
                  isJQL
                  projectKeyFilters
                }
                projects {
                  id
                  name
                }
              }
            }
          }
        }
      }
    `,
    meetingRef
  )

  const {id: meetingId, teamId} = meeting
  const {jiraSearchQueries} = meeting.viewerMeetingMember?.teamMember.integrations?.atlassian ?? {}

  const searchQueries =
    jiraSearchQueries?.map((jiraSearchQuery) => {
      const {id, queryString, isJQL, projectKeyFilters} = jiraSearchQuery

      const selectQuery = () => {
        commitLocalUpdate(atmosphere, (store) => {
          const searchQueryId = SearchQueryId.join('jira', meetingId)
          const jiraSearchQuery = store.get(searchQueryId)!
          jiraSearchQuery.setValue(isJQL, 'isJQL')
          jiraSearchQuery.setValue(queryString, 'queryString')
          jiraSearchQuery.setValue(projectKeyFilters as string[], 'projectKeyFilters')
        })
      }
      const queryStringLabel = isJQL ? queryString : `“${queryString}”`
      const projectFilters = projectKeyFilters
        .map((filter) => filter.slice(filter.indexOf(':') + 1))
        .join(', ')

      const removeJiraSearchQuery = (jiraSearchQuery) => {
        const {queryString, isJQL, projectKeyFilters} = jiraSearchQuery

        PersistJiraSearchQueryMutation(atmosphere, {
          teamId,
          input: {queryString, isJQL, projectKeyFilters, isRemove: true}
        })
      }

      const handleRemoveJiraSearchQueryClick = () => {
        removeJiraSearchQuery(jiraSearchQuery)
      }

      return {
        id,
        ariaLabel: 'Remove this Jira Search Query',
        labelFirstLine: queryStringLabel,
        labelSecondLine: projectFilters && `in ${projectFilters}`,
        onClick: selectQuery,
        onDelete: handleRemoveJiraSearchQueryClick
      }
    }) ?? []

  return <ScopingSearchHistoryToggle searchQueries={searchQueries} />
}

export default JiraScopingSearchHistoryToggle
