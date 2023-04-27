import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useLazyLoadQuery} from 'react-relay'
import {MenuProps} from '../hooks/useMenu'
import {JiraServerScopingSearchFilterMenuRootQuery} from '../__generated__/JiraServerScopingSearchFilterMenuRootQuery.graphql'
import JiraScopingSearchFilterMenu from './JiraScopingSearchFilterMenu'

const query = graphql`
  query JiraServerScopingSearchFilterMenuRootQuery($teamId: ID!, $meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        id
        ... on PokerMeeting {
          jiraServerSearchQuery {
            projectKeyFilters
            isJQL
          }
        }
      }
      teamMember(teamId: $teamId) {
        integrations {
          jiraServer {
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

const JiraServerScopingSearchFilterMenuRoot = (props: Props) => {
  const {menuProps, teamId, meetingId} = props

  const data = useLazyLoadQuery<JiraServerScopingSearchFilterMenuRootQuery>(
    query,
    {
      teamId,
      meetingId
    },
    {
      fetchPolicy: 'store-or-network'
    }
  )

  const projects = data?.viewer.teamMember?.integrations.jiraServer?.projects ?? []
  const jiraSearchQuery = data?.viewer.meeting?.jiraServerSearchQuery ?? null

  return (
    <JiraScopingSearchFilterMenu
      meetingId={meetingId}
      jiraSearchQuery={jiraSearchQuery}
      projects={projects}
      menuProps={menuProps}
      service='jiraServer'
    />
  )
}

export default JiraServerScopingSearchFilterMenuRoot
