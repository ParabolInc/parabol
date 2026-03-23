import graphql from 'babel-plugin-relay/macro'
import type {ReactNode} from 'react'
import {useFragment} from 'react-relay'
import type {JiraScopingSearchBarLabel_integration$key} from '../__generated__/JiraScopingSearchBarLabel_integration.graphql'
import type {JiraScopingSearchBarLabel_meeting$key} from '../__generated__/JiraScopingSearchBarLabel_meeting.graphql'
import ScopingSearchBar from './ScopingSearchBar'

interface Props {
  children: ReactNode
  integrationRef: JiraScopingSearchBarLabel_integration$key
  meetingRef: JiraScopingSearchBarLabel_meeting$key
}

export const JiraScopingSearchBarLabel = (props: Props) => {
  const {children, integrationRef, meetingRef} = props
  const meeting = useFragment(
    graphql`
  fragment JiraScopingSearchBarLabel_meeting on PokerMeeting {
    jiraSearchQuery {
          queryString
          projectKeyFilters
          isJQL
        }
  }`,
    meetingRef
  )
  const integration = useFragment(
    graphql`
  fragment JiraScopingSearchBarLabel_integration on AtlassianIntegration {
    projects {
      id
      name
    }
  }`,
    integrationRef
  )
  const {jiraSearchQuery} = meeting
  const {queryString, projectKeyFilters} = jiraSearchQuery
  const {projects} = integration
  const selectedProjectsPaths = [] as string[]
  projectKeyFilters?.forEach((projectId) => {
    const selectedProjectPath = projects?.find((project) => project.id === projectId)?.name
    if (selectedProjectPath) selectedProjectsPaths.push(selectedProjectPath)
  })
  const currentFilters = selectedProjectsPaths.length
    ? selectedProjectsPaths.join(', ')
    : queryString
      ? 'None'
      : 'Viewed in the last 30 days'
  return <ScopingSearchBar currentFilters={currentFilters}>{children}</ScopingSearchBar>
}
