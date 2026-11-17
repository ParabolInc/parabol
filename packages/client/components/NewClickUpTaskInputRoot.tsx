import newClickUpTaskInputQuery, {
  type NewClickUpTaskInputQuery
} from '../__generated__/NewClickUpTaskInputQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import type {NewRecordInputProps} from '../integrations/platform/ScopingSearchState'
import NewClickUpTaskInput from './NewClickUpTaskInput'

const NewClickUpTaskInputRoot = (props: NewRecordInputProps) => {
  const {teamId} = props
  const queryRef = useQueryLoaderNow<NewClickUpTaskInputQuery>(newClickUpTaskInputQuery, {teamId})
  if (!queryRef) return null
  return <NewClickUpTaskInput {...props} queryRef={queryRef} />
}

export default NewClickUpTaskInputRoot
