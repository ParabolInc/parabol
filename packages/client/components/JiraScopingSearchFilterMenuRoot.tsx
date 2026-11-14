import jiraCloudScopingSearchFilterMenuQuery, {
  type JiraCloudScopingSearchFilterMenuQuery
} from '../__generated__/JiraCloudScopingSearchFilterMenuQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import type {FilterMenuProps} from '../integrations/platform/ScopingSearchState'
import JiraCloudScopingSearchFilterMenu from './JiraCloudScopingSearchFilterMenu'

const JiraScopingSearchFilterMenuRoot = (props: FilterMenuProps) => {
  const {teamId, meetingId, state} = props
  const queryRef = useQueryLoaderNow<JiraCloudScopingSearchFilterMenuQuery>(
    jiraCloudScopingSearchFilterMenuQuery,
    {teamId}
  )
  if (!queryRef) return null
  return (
    <JiraCloudScopingSearchFilterMenu meetingId={meetingId} state={state} queryRef={queryRef} />
  )
}

export default JiraScopingSearchFilterMenuRoot
