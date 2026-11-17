import newAzureIssueInputQuery, {
  type NewAzureIssueInputQuery
} from '../__generated__/NewAzureIssueInputQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import type {NewRecordInputProps} from '../integrations/platform/ScopingSearchState'
import NewAzureIssueInput from './NewAzureIssueInput'

const NewAzureIssueInputRoot = (props: NewRecordInputProps) => {
  const {teamId} = props
  const queryRef = useQueryLoaderNow<NewAzureIssueInputQuery>(newAzureIssueInputQuery, {teamId})
  if (!queryRef) return null
  return <NewAzureIssueInput {...props} queryRef={queryRef} />
}

export default NewAzureIssueInputRoot
