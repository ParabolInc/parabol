import azureDevOpsScopingSearchFilterMenuQuery, {
  type AzureDevOpsScopingSearchFilterMenuQuery
} from '../__generated__/AzureDevOpsScopingSearchFilterMenuQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import type {FilterMenuProps} from '../integrations/platform/ScopingSearchState'
import AzureDevOpsScopingSearchFilterMenu from './AzureDevOpsScopingSearchFilterMenu'

const AzureDevOpsScopingSearchFilterMenuRoot = (props: FilterMenuProps) => {
  const {teamId, meetingId, state} = props
  const queryRef = useQueryLoaderNow<AzureDevOpsScopingSearchFilterMenuQuery>(
    azureDevOpsScopingSearchFilterMenuQuery,
    {teamId}
  )
  if (!queryRef) return null
  return (
    <AzureDevOpsScopingSearchFilterMenu meetingId={meetingId} state={state} queryRef={queryRef} />
  )
}

export default AzureDevOpsScopingSearchFilterMenuRoot
