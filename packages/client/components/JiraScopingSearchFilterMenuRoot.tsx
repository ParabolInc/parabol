import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useLazyLoadQuery} from 'react-relay'
import {MenuProps} from '../hooks/useMenu'
import {JiraScopingSearchFilterMenuRootQuery} from '../__generated__/JiraScopingSearchFilterMenuRootQuery.graphql'
import JiraScopingSearchFilterMenu from './JiraScopingSearchFilterMenu'

const query = graphql`
  query JiraScopingSearchFilterMenuRootQuery($teamId: ID!, $meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        id
        ... on PokerMeeting {
          jiraSearchQuery {
            projectKeyFilters
            isJQL
          }
        }
      }
      teamMember(teamId: $teamId) {
        integrations {
          atlassian {
            projects {
              id
              name
              avatar
            }
          }
        }
      }
    }
  }
`

interface Props {
  menuProps: MenuProps
  teamId: string
  meetingId: string
}

const JiraScopingSearchFilterMenuRoot = (props: Props) => {
  const {menuProps, teamId, meetingId} = props

  const data = useLazyLoadQuery<JiraScopingSearchFilterMenuRootQuery>(
    query,
    {
      teamId,
      meetingId
    },
    {
      fetchPolicy: 'store-or-network'
    }
  )

  const projects = data.viewer.teamMember?.integrations.atlassian?.projects ?? []
  const jiraSearchQuery = data.viewer.meeting?.jiraSearchQuery ?? null

  return (
    <JiraScopingSearchFilterMenu
      meetingId={meetingId}
      jiraSearchQuery={jiraSearchQuery}
      projects={projects}
      menuProps={menuProps}
      service={'jira'}
    />
  )
}

export default JiraScopingSearchFilterMenuRoot
