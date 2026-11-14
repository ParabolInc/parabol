import newGitLabIssueInputQuery, {
  type NewGitLabIssueInputQuery
} from '../__generated__/NewGitLabIssueInputQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import type {NewRecordInputProps} from '../integrations/platform/ScopingSearchState'
import NewGitLabIssueInput from './NewGitLabIssueInput'

const NewGitLabIssueInputRoot = (props: NewRecordInputProps) => {
  const {teamId} = props
  const queryRef = useQueryLoaderNow<NewGitLabIssueInputQuery>(newGitLabIssueInputQuery, {teamId})
  if (!queryRef) return null
  return <NewGitLabIssueInput {...props} queryRef={queryRef} />
}

export default NewGitLabIssueInputRoot
