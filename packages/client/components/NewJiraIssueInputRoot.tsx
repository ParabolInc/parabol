import newJiraIssueInputQuery, {
  type NewJiraIssueInputQuery
} from '../__generated__/NewJiraIssueInputQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import type {NewRecordInputProps} from '../integrations/platform/ScopingSearchState'
import NewJiraIssueInput from './NewJiraIssueInput'

const NewJiraIssueInputRoot = (props: NewRecordInputProps) => {
  const {teamId} = props
  const queryRef = useQueryLoaderNow<NewJiraIssueInputQuery>(newJiraIssueInputQuery, {teamId})
  if (!queryRef) return null
  return <NewJiraIssueInput {...props} queryRef={queryRef} />
}

export default NewJiraIssueInputRoot
