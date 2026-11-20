import {Suspense} from 'react'
import {useQueryLoader} from 'react-relay'
import {ExpandMore, FilterList} from '~/ui/icons'
import clickUpListSearchFilterMenuQuery, {
  type ClickUpListSearchFilterMenuQuery
} from '../../../__generated__/ClickUpListSearchFilterMenuQuery.graphql'
import {cn} from '../../../ui/cn'
import {Menu} from '../../../ui/Menu/Menu'
import {MenuContent} from '../../../ui/Menu/MenuContent'
import plural from '../../../utils/plural'
import ClickUpListSearchFilterMenu from '../../ClickUpListSearchFilterMenu'
import MockFieldList from '../../MockFieldList'

interface Props {
  teamId: string
  selectedListIds: string[]
  setSelectedListIds: (listIds: string[]) => void
}

const ClickUpListFilterBar = (props: Props) => {
  const {teamId, selectedListIds, setSelectedListIds} = props
  const [queryRef, loadQuery] = useQueryLoader<ClickUpListSearchFilterMenuQuery>(
    clickUpListSearchFilterMenuQuery
  )
  const preload = () => {
    if (!queryRef) loadQuery({teamId}, {fetchPolicy: 'store-or-network'})
  }
  const selectedCount = selectedListIds.length
  const toggleList = (listId: string) =>
    setSelectedListIds(
      selectedListIds.includes(listId)
        ? selectedListIds.filter((selectedListId) => selectedListId !== listId)
        : [...selectedListIds, listId]
    )

  return (
    <Menu
      onOpenChange={(isOpen) => isOpen && preload()}
      trigger={
        <button
          type='button'
          onMouseEnter={preload}
          onFocus={preload}
          className='group flex cursor-pointer items-center gap-2 rounded-sm border border-hairline border-solid bg-surface-card px-3 py-0.5 text-left transition hover:border-hairline-strong data-[state=open]:border-accent'
        >
          <FilterList className='h-5 w-5 text-fg-secondary' />
          {selectedCount === 0
            ? 'All lists'
            : `${selectedCount} ${plural(selectedCount, 'list')} selected`}
          <ExpandMore
            className={cn(
              'ml-auto rounded-full transition duration-300 group-data-[state=open]:rotate-180',
              selectedCount > 0 &&
                'group-data-[state=closed]:bg-accent group-data-[state=closed]:text-white'
            )}
          />
        </button>
      }
    >
      <MenuContent align='start' className='max-h-80 w-(--radix-dropdown-menu-trigger-width) pt-2'>
        <Suspense fallback={<MockFieldList />}>
          {queryRef ? (
            <ClickUpListSearchFilterMenu
              queryRef={queryRef}
              selectedListIds={selectedListIds}
              onToggleList={toggleList}
            />
          ) : (
            <MockFieldList />
          )}
        </Suspense>
      </MenuContent>
    </Menu>
  )
}

export default ClickUpListFilterBar
