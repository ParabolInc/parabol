import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {useFragment} from 'react-relay'
import {SprintPokerDefaults} from '../types/constEnums'
import {GitHubScopingSearchBar_meeting$key} from '../__generated__/GitHubScopingSearchBar_meeting.graphql'
import GitHubScopingSearchFilterToggle from './GitHubScopingSearchFilterToggle'
import GitHubScopingSearchHistoryToggle from './GitHubScopingSearchHistoryToggle'
import ScopingSearchBar from './ScopingSearchBar'
import ScopingSearchInput from './ScopingSearchInput'

interface Props {
  meetingRef: GitHubScopingSearchBar_meeting$key
}

const GitHubScopingSearchBar = (props: Props) => {
  const {meetingRef} = props

  const {t} = useTranslation()

  graphql`
    fragment GitHubScopingSearchBarGitHubIntegration on GitHubIntegration {
      githubSearchQueries {
        queryString
      }
    }
  `

  const meeting = useFragment(
    graphql`
      fragment GitHubScopingSearchBar_meeting on PokerMeeting {
        id
        githubSearchQuery {
          queryString
        }
        viewerMeetingMember {
          teamMember {
            integrations {
              github {
                ...GitHubScopingSearchBarGitHubIntegration @relay(mask: false)
              }
            }
          }
        }
        ...GitHubScopingSearchHistoryToggle_meeting
        ...GitHubScopingSearchFilterToggle_meeting
      }
    `,
    meetingRef
  )

  const {queryString} = meeting.githubSearchQuery

  const githubSearchQueries =
    meeting.viewerMeetingMember?.teamMember?.integrations?.github?.githubSearchQueries
  const defaultInput =
    githubSearchQueries?.[0]?.queryString ?? SprintPokerDefaults.GITHUB_DEFAULT_QUERY

  return (
    <ScopingSearchBar>
      <GitHubScopingSearchHistoryToggle meetingRef={meeting} />
      <ScopingSearchInput
        placeholder={t('GitHubScopingSearchBar.SearchGithubIssues')}
        queryString={queryString}
        meetingId={meeting.id}
        linkedRecordName={t('GitHubScopingSearchBar.Githubsearchquery')}
        defaultInput={defaultInput}
        service={t('GitHubScopingSearchBar.Github')}
      />
      <GitHubScopingSearchFilterToggle meetingRef={meeting} />
    </ScopingSearchBar>
  )
}

export default GitHubScopingSearchBar
