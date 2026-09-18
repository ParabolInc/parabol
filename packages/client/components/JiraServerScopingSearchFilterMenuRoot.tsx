import jiraServerScopingSearchFilterMenuQuery, {
  type JiraServerScopingSearchFilterMenuQuery
} from '../__generated__/JiraServerScopingSearchFilterMenuQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import type {FilterMenuProps} from '../integrations/platform/ScopingSearchState'
import JiraServerScopingSearchFilterMenu from './JiraServerScopingSearchFilterMenu'

const JiraServerScopingSearchFilterMenuRoot = (props: FilterMenuProps) => {
  const {teamId, meetingId, state} = props
  const queryRef = useQueryLoaderNow<JiraServerScopingSearchFilterMenuQuery>(
    jiraServerScopingSearchFilterMenuQuery,
    {teamId}
  )
  if (!queryRef) return null
  return (
    <JiraServerScopingSearchFilterMenu meetingId={meetingId} state={state} queryRef={queryRef} />
  )
}

export default JiraServerScopingSearchFilterMenuRoot
