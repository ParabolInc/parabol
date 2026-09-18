import graphql from 'babel-plugin-relay/macro'
import {useLazyLoadQuery} from 'react-relay'
import type {JiraScopingSearchFilterMenuRootQuery} from '../__generated__/JiraScopingSearchFilterMenuRootQuery.graphql'
import type {FilterMenuProps} from '../integrations/platform/ScopingSearchState'
import JiraScopingSearchFilterMenu from './JiraScopingSearchFilterMenu'

const query = graphql`
  query JiraScopingSearchFilterMenuRootQuery($teamId: ID!) {
    viewer {
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

const JiraScopingSearchFilterMenuRoot = (props: FilterMenuProps) => {
  const {teamId, meetingId, state} = props

  const data = useLazyLoadQuery<JiraScopingSearchFilterMenuRootQuery>(
    query,
    {teamId},
    {fetchPolicy: 'store-or-network'}
  )

  const projects = data.viewer.teamMember?.integrations.atlassian?.projects ?? []

  return (
    <JiraScopingSearchFilterMenu
      meetingId={meetingId}
      state={state}
      projects={projects}
      service={'jira'}
    />
  )
}

export default JiraScopingSearchFilterMenuRoot
