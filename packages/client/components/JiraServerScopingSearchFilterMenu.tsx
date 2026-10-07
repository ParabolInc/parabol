import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {JiraServerScopingSearchFilterMenuQuery} from '../__generated__/JiraServerScopingSearchFilterMenuQuery.graphql'
import type {ScopingSearchState} from '../integrations/platform/ScopingSearchState'
import JiraScopingSearchFilterMenu from './JiraScopingSearchFilterMenu'

interface Props {
  meetingId: string
  state: ScopingSearchState
  queryRef: PreloadedQuery<JiraServerScopingSearchFilterMenuQuery>
}

const JiraServerScopingSearchFilterMenu = (props: Props) => {
  const {meetingId, state, queryRef} = props
  const data = usePreloadedQuery<JiraServerScopingSearchFilterMenuQuery>(
    graphql`
      query JiraServerScopingSearchFilterMenuQuery($teamId: ID!) {
        viewer {
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
    `,
    queryRef
  )
  const projects = data.viewer.teamMember?.integrations.jiraServer?.projects ?? []
  return (
    <JiraScopingSearchFilterMenu
      meetingId={meetingId}
      state={state}
      projects={projects}
      service='jiraServer'
    />
  )
}

export default JiraServerScopingSearchFilterMenu
