import graphql from 'babel-plugin-relay/macro'
import clsx from 'clsx'
import {useFragment} from 'react-relay'
import {ExpandMore, FilterList} from '~/ui/icons'
import type {LinearProjectFilterBar_teamMember$key} from '../../../__generated__/LinearProjectFilterBar_teamMember.graphql'
import useLinearProjectsAndTeams from '../../../hooks/useLinearProjectsAndTeams'
import {Menu} from '../../../ui/Menu/Menu'
import {MenuContent} from '../../../ui/Menu/MenuContent'
import plural from '../../../utils/plural'
import LinearSelectorMenu from '../../LinearSelectorMenu'

interface Props {
  teamMemberRef: LinearProjectFilterBar_teamMember$key
  selectedLinearIds: string[]
  setSelectedLinearIds: (ids: string[]) => void
}

const LinearProjectFilterBar = (props: Props) => {
  const {teamMemberRef, selectedLinearIds, setSelectedLinearIds} = props
  const teamMember = useFragment(
    graphql`
      fragment LinearProjectFilterBar_teamMember on TeamMember {
        ...useLinearProjectsAndTeams_teamMember @defer
      }
    `,
    teamMemberRef
  )

  const {searchQuery, setSearchQuery, filteredProjectsAndTeams} =
    useLinearProjectsAndTeams(teamMember)

  const handleSelectItem = (itemId: string, isSelected: boolean) => {
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
        <button className='group mx-4 mt-4 mb-2 flex cursor-pointer items-center gap-2 rounded-sm border border-hairline border-solid bg-surface-card px-3 py-0.5 text-left transition hover:border-hairline-strong data-[state=open]:border-accent'>
          <FilterList className='h-5 w-5 text-fg-secondary' />
          {buttonLabel}
          <ExpandMore
            className={clsx(
              'ml-auto rounded-full transition duration-300 group-data-[state=open]:rotate-180',
              selectedLinearIds.length > 0 &&
                'group-data-[state=closed]:bg-accent group-data-[state=closed]:text-white'
            )}
          />
        </button>
      }
    >
      <MenuContent align='start' className='max-w-full'>
        <LinearSelectorMenu
          items={filteredProjectsAndTeams}
          selectedItemIds={selectedLinearIds}
          onSelectItem={handleSelectItem}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          placeholder='Search Linear projects or teams'
          emptyStateMessage='No projects or teams found!'
        />
      </MenuContent>
    </Menu>
  )
}

export default LinearProjectFilterBar
