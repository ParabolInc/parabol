import {Suspense} from 'react'
import {ExpandMore, FilterList} from '~/ui/icons'
import type {LinearProjectOrTeam} from '../../../hooks/useLinearProjectsAndTeams'
import getLinearSelectorItemId from '../../../integrations/linear/getLinearSelectorItemId'
import {cn} from '../../../ui/cn'
import {Menu} from '../../../ui/Menu/Menu'
import {MenuContent} from '../../../ui/Menu/MenuContent'
import plural from '../../../utils/plural'
import LinearProjectAndTeamMenuRoot from '../../LinearProjectAndTeamMenuRoot'
import MockFieldList from '../../MockFieldList'

interface Props {
  teamId: string
  selectedLinearIds: string[]
  setSelectedLinearIds: (ids: string[]) => void
  className?: string
}

const LinearProjectFilterBar = (props: Props) => {
  const {teamId, selectedLinearIds, setSelectedLinearIds, className} = props

  const handleSelectItem = (item: LinearProjectOrTeam, isSelected: boolean) => {
    const itemId = getLinearSelectorItemId(item)
    if (!isSelected) {
      setSelectedLinearIds([...selectedLinearIds, itemId])
    } else {
      setSelectedLinearIds(selectedLinearIds.filter((id) => id !== itemId))
    }
  }

  const buttonLabel =
    selectedLinearIds.length === 0
      ? 'All projects & teams'
      : `${selectedLinearIds.length} ${plural(selectedLinearIds.length, 'item', 'items')} selected`

  return (
    <Menu
      trigger={
        <button
          className={cn(
            'group mx-4 mt-4 mb-2 flex cursor-pointer items-center gap-2 rounded-sm border border-hairline border-solid bg-surface-card px-3 py-0.5 text-left transition hover:border-hairline-strong data-[state=open]:border-accent',
            className
          )}
        >
          <FilterList className='h-5 w-5 text-fg-secondary' />
          {buttonLabel}
          <ExpandMore
            className={cn(
              'ml-auto rounded-full transition duration-300 group-data-[state=open]:rotate-180',
              selectedLinearIds.length > 0 &&
                'group-data-[state=closed]:bg-accent group-data-[state=closed]:text-white'
            )}
          />
        </button>
      }
    >
      <MenuContent align='start' className='max-w-full'>
        <Suspense fallback={<MockFieldList />}>
          <LinearProjectAndTeamMenuRoot
            teamId={teamId}
            selectedItemIds={selectedLinearIds}
            onSelectItem={handleSelectItem}
          />
        </Suspense>
      </MenuContent>
    </Menu>
  )
}

export default LinearProjectFilterBar
