import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import PersistJiraSearchQueryMutation from '../mutations/PersistJiraSearchQueryMutation'
import SearchQueryId from '../shared/gqlIds/SearchQueryId'
import {JiraScopingSearchBar_meeting$key} from '../__generated__/JiraScopingSearchBar_meeting.graphql'
import JiraScopingSearchFilterToggle from './JiraScopingSearchFilterToggle'
import ScopingSearchBar from './ScopingSearchBar'
import ScopingSearchHistoryToggle from './ScopingSearchHistoryToggle'
import ScopingSearchInput from './ScopingSearchInput'

interface Props {
  meetingRef: JiraScopingSearchBar_meeting$key
}

const JiraScopingSearchBar = (props: Props) => {
  const {meetingRef} = props
  const atmosphere = useAtmosphere()

  const meeting = useFragment(
    graphql`
      fragment JiraScopingSearchBar_meeting on PokerMeeting {
        ...JiraScopingSearchFilterToggle_meeting
        id
        teamId
        jiraSearchQuery {
          projectKeyFilters
          queryString
          isJQL
        }
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

  const {jiraSearchQuery, viewerMeetingMember} = meeting
  const {isJQL, queryString, projectKeyFilters} = jiraSearchQuery
  const projects = viewerMeetingMember?.teamMember.integrations.atlassian?.projects

  const selectedProjectsPaths = [] as string[]
  projectKeyFilters?.forEach((projectId) => {
    const selectedProjectPath = projects?.find((project) => project.id === projectId)?.name
    if (selectedProjectPath) selectedProjectsPaths.push(selectedProjectPath)
  })
  const currentFilters = selectedProjectsPaths.length ? selectedProjectsPaths.join(', ') : 'None'

  const placeholder = isJQL ? `SPRINT = fun AND PROJECT = dev` : 'Search issues on Jira'
  return (
    <ScopingSearchBar currentFilters={currentFilters}>
      <ScopingSearchHistoryToggle searchQueries={searchQueries} />
      <ScopingSearchInput
        placeholder={placeholder}
        queryString={queryString}
        meetingId={meetingId}
        linkedRecordName={'jiraSearchQuery'}
      />
      <JiraScopingSearchFilterToggle meetingRef={meeting} />
    </ScopingSearchBar>
  )
}

export default JiraScopingSearchBar
