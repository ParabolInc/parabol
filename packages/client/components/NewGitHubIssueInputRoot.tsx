import newGitHubIssueInputQuery, {
  type NewGitHubIssueInputQuery
} from '../__generated__/NewGitHubIssueInputQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import type {NewRecordInputProps} from '../integrations/platform/ScopingSearchState'
import NewGitHubIssueInput from './NewGitHubIssueInput'

const NewGitHubIssueInputRoot = (props: NewRecordInputProps) => {
  const {teamId} = props
  const queryRef = useQueryLoaderNow<NewGitHubIssueInputQuery>(newGitHubIssueInputQuery, {teamId})
  if (!queryRef) return null
  return <NewGitHubIssueInput {...props} queryRef={queryRef} />
}

export default NewGitHubIssueInputRoot
