import newLinearIssueInputQuery, {
  type NewLinearIssueInputQuery
} from '../__generated__/NewLinearIssueInputQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import type {NewRecordInputProps} from '../integrations/platform/ScopingSearchState'
import NewLinearIssueInput from './NewLinearIssueInput'

const NewLinearIssueInputRoot = (props: NewRecordInputProps) => {
  const {teamId} = props
  const queryRef = useQueryLoaderNow<NewLinearIssueInputQuery>(newLinearIssueInputQuery, {teamId})
  if (!queryRef) return null
  return <NewLinearIssueInput {...props} queryRef={queryRef} />
}

export default NewLinearIssueInputRoot
