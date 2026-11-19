import clickUpListSearchFilterMenuQuery, {
  type ClickUpListSearchFilterMenuQuery
} from '../__generated__/ClickUpListSearchFilterMenuQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import ClickUpListSearchFilterMenu from './ClickUpListSearchFilterMenu'

interface Props {
  teamId: string
  selectedListIds: string[]
  onToggleList: (listId: string) => void
}

const ClickUpListSearchFilterMenuRoot = (props: Props) => {
  const {teamId, ...menuProps} = props
  const queryRef = useQueryLoaderNow<ClickUpListSearchFilterMenuQuery>(
    clickUpListSearchFilterMenuQuery,
    {teamId}
  )
  if (!queryRef) return null
  return <ClickUpListSearchFilterMenu queryRef={queryRef} {...menuProps} />
}

export default ClickUpListSearchFilterMenuRoot
