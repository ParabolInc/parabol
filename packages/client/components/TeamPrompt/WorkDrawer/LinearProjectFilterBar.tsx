import {ExpandMore, FilterList} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import clsx from 'clsx'
import {useFragment} from 'react-relay'
import type {LinearProjectFilterBar_teamMember$key} from '../../../__generated__/LinearProjectFilterBar_teamMember.graphql'
import {MenuPosition} from '../../../hooks/useCoords'
import useLinearProjectsAndTeams from '../../../hooks/useLinearProjectsAndTeams'
import useMenu from '../../../hooks/useMenu'
import {PortalStatus} from '../../../hooks/usePortal'
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

  const {togglePortal, originRef, menuPortal, menuProps, portalStatus} = useMenu(
    MenuPosition.UPPER_LEFT,
    {
      loadingWidth: 200,
      noClose: true,
      isDropdown: true
    }
  )

  const isMenuOpen = ![PortalStatus.Exited, PortalStatus.Exiting].includes(portalStatus)

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
    <>
      <button
        className={clsx(
          'mx-4 mt-4 mb-2 flex cursor-pointer items-center gap-2 rounded-sm border border-solid bg-surface-card px-3 py-0.5 text-left transition',
          isMenuOpen ? 'border-accent' : 'border-hairline hover:border-hairline-strong'
        )}
        onClick={togglePortal}
        ref={originRef}
      >
        <FilterList className='h-5 w-5 text-fg-secondary' />
        {buttonLabel}
        <ExpandMore
          className={clsx(
            'ml-auto rounded-full transition duration-300',
            isMenuOpen ? 'rotate-180' : '',
            selectedLinearIds.length > 0 && !isMenuOpen ? 'bg-accent text-white' : ''
          )}
        />
      </button>
      {menuPortal(
        <LinearSelectorMenu
          items={filteredProjectsAndTeams}
          selectedItemIds={selectedLinearIds}
          onSelectItem={handleSelectItem}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          menuProps={menuProps}
          placeholder='Search Linear projects or teams'
          emptyStateMessage='No projects or teams found!'
        />
      )}
    </>
  )
}

export default LinearProjectFilterBar
