import {Suspense} from 'react'
import type {ScopingCapability} from '../integrations/platform/ClientIntegrationDefinition'
import type {ScopingSearchState} from '../integrations/platform/ScopingSearchState'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import FilterButton from './FilterButton'
import MockFieldList from './MockFieldList'

interface Props {
  scoping: ScopingCapability
  meetingId: string
  teamId: string
  state: ScopingSearchState
}

const IntegrationScopingFilterToggle = (props: Props) => {
  const {scoping, meetingId, teamId, state} = props
  const {FilterMenu} = scoping
  if (!FilterMenu) return null
  return (
    <Menu trigger={<FilterButton onMouseEnter={FilterMenu.preload} />}>
      <MenuContent align='end' className='w-[250px]'>
        <Suspense fallback={<MockFieldList />}>
          <FilterMenu meetingId={meetingId} teamId={teamId} state={state} />
        </Suspense>
      </MenuContent>
    </Menu>
  )
}

export default IntegrationScopingFilterToggle
