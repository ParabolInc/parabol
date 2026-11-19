import {Suspense} from 'react'
import {useQueryLoader} from 'react-relay'
import {ExpandMore, FilterList} from '~/ui/icons'
import jiraProjectFilterMenuQuery, {
  type JiraProjectFilterMenuQuery
} from '../../../__generated__/JiraProjectFilterMenuQuery.graphql'
import {cn} from '../../../ui/cn'
import {Menu} from '../../../ui/Menu/Menu'
import {MenuContent} from '../../../ui/Menu/MenuContent'
import plural from '../../../utils/plural'
import MockFieldList from '../../MockFieldList'
import JiraProjectFilterMenu from './JiraProjectFilterMenu'

interface Props {
  teamId: string
  selectedProjectIds: string[]
  setSelectedProjectIds: (projectIds: string[]) => void
}

const JiraProjectFilterBar = (props: Props) => {
  const {teamId, selectedProjectIds, setSelectedProjectIds} = props
  const [queryRef, loadQuery] = useQueryLoader<JiraProjectFilterMenuQuery>(
    jiraProjectFilterMenuQuery
  )
  const preload = () => {
    if (!queryRef) loadQuery({teamId}, {fetchPolicy: 'store-or-network'})
  }
  const selectedCount = selectedProjectIds.length

  return (
    <Menu
      onOpenChange={(isOpen) => isOpen && preload()}
      trigger={
        <button
          onMouseEnter={preload}
          onFocus={preload}
          className='group flex cursor-pointer items-center gap-2 rounded-sm border border-hairline border-solid bg-surface-card px-3 py-0.5 text-left transition hover:border-hairline-strong data-[state=open]:border-accent'
        >
          <FilterList className='h-5 w-5 text-fg-secondary' />
          {selectedCount === 0
            ? 'All projects'
            : `${selectedCount} ${plural(selectedCount, 'project')} selected`}
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
            <JiraProjectFilterMenu
              queryRef={queryRef}
              selectedProjectIds={selectedProjectIds}
              setSelectedProjectIds={setSelectedProjectIds}
            />
          ) : (
            <MockFieldList />
          )}
        </Suspense>
      </MenuContent>
    </Menu>
  )
}

export default JiraProjectFilterBar
