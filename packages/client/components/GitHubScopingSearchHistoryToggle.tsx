import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import PersistGitHubSearchQueryMutation from '../mutations/PersistGitHubSearchQueryMutation'
import SearchQueryId from '../shared/gqlIds/SearchQueryId'
import {GitHubScopingSearchHistoryToggle_meeting$key} from '../__generated__/GitHubScopingSearchHistoryToggle_meeting.graphql'
import ScopingSearchHistoryToggle from './ScopingSearchHistoryToggle'

interface Props {
  meetingRef: GitHubScopingSearchHistoryToggle_meeting$key
}

const GitHubScopingSearchHistoryToggle = (props: Props) => {
  const {meetingRef} = props
  const atmosphere = useAtmosphere()
  const meeting = useFragment(
    graphql`
      fragment GitHubScopingSearchHistoryToggle_meeting on PokerMeeting {
        id
        teamId
        viewerMeetingMember {
          teamMember {
            teamId
            integrations {
              github {
                githubSearchQueries {
                  id
                  queryString
                }
              }
            }
          }
        }
      }
    `,
    meetingRef
  )
  const {id: meetingId, viewerMeetingMember} = meeting!
  if (!viewerMeetingMember) return null
  const {teamMember} = viewerMeetingMember
  const {teamId, integrations} = teamMember
  const githubSearchQueries = integrations.github?.githubSearchQueries

  const searchQueries =
    githubSearchQueries?.map((githubSearchQuery) => {
      const {id, queryString} = githubSearchQuery

      const selectQuery = () => {
        commitLocalUpdate(atmosphere, (store) => {
          const searchQueryId = SearchQueryId.join('github', meetingId)
          const githubSearchQuery = store.get(searchQueryId)!
          githubSearchQuery.setValue(queryString, 'queryString')
        })
      }

      const deleteQuery = () => {
        const normalizedQueryString = queryString.toLowerCase().trim()
        PersistGitHubSearchQueryMutation(atmosphere, {
          teamId,
          queryString: normalizedQueryString,
          isRemove: true
        })
      }

      return {
        id,
        labelFirstLine: queryString,
        onClick: selectQuery,
        onDelete: deleteQuery
      }
    }) ?? []

  return <ScopingSearchHistoryToggle searchQueries={searchQueries} />
}

export default GitHubScopingSearchHistoryToggle
