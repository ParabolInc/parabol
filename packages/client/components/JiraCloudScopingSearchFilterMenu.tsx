import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {JiraCloudScopingSearchFilterMenuQuery} from '../__generated__/JiraCloudScopingSearchFilterMenuQuery.graphql'
import type {ScopingSearchState} from '../integrations/platform/ScopingSearchState'
import JiraScopingSearchFilterMenu from './JiraScopingSearchFilterMenu'

interface Props {
  meetingId: string
  state: ScopingSearchState
  queryRef: PreloadedQuery<JiraCloudScopingSearchFilterMenuQuery>
}

const JiraCloudScopingSearchFilterMenu = (props: Props) => {
  const {meetingId, state, queryRef} = props
  const data = usePreloadedQuery<JiraCloudScopingSearchFilterMenuQuery>(
    graphql`
      query JiraCloudScopingSearchFilterMenuQuery($teamId: ID!) {
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
    `,
    queryRef
  )
  const projects = data.viewer.teamMember?.integrations.atlassian?.projects ?? []
  return (
    <JiraScopingSearchFilterMenu
      meetingId={meetingId}
      state={state}
      projects={projects}
      service='jira'
    />
  )
}

export default JiraCloudScopingSearchFilterMenu
