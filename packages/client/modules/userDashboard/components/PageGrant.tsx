import {cn} from '../../../ui/cn'
import {RadioGroup, RadioGroupItem} from '../../../ui/RadioGroup/RadioGroup'
import type {GrantModeOption} from './PersonalAccessTokenCreateDialog'
import {PersonalAccessTokenPageGrantRoot} from './PersonalAccessTokenPageGrantRoot'

export interface PageResult {
  id: string
  title: string | null
}

interface Props {
  pageGrantMode: GrantModeOption
  setPageGrantMode: (mode: GrantModeOption) => void
  selectedPageIds: Set<string>
  selectedPagesMap: Map<string, PageResult>
  togglePage: (page: PageResult) => void
  orgGrantMode: GrantModeOption
  selectedOrgIds: Set<string>
  selectedTeamIds: Set<string>
}

export const PageGrant = ({
  pageGrantMode,
  setPageGrantMode,
  selectedPageIds,
  selectedPagesMap,
  togglePage,
  orgGrantMode,
  selectedOrgIds,
  selectedTeamIds
}: Props) => {
  return (
    <div className={cn('flex flex-col gap-2')}>
      <div className='flex items-center gap-2'>
        <span className='font-medium text-slate-700 text-sm'>Pages</span>
        <RadioGroup
          value={pageGrantMode}
          onValueChange={(v) => setPageGrantMode(v as GrantModeOption)}
          className='flex flex-row gap-3'
        >
          <label className='flex cursor-pointer select-none items-center gap-1 text-slate-600 text-xs'>
            <RadioGroupItem value='all' />
            All
          </label>
          <label className='flex cursor-pointer select-none items-center gap-1 text-slate-600 text-xs'>
            <RadioGroupItem value='custom' />
            Custom
          </label>
        </RadioGroup>
      </div>
      {pageGrantMode === 'custom' && (
        <PersonalAccessTokenPageGrantRoot
          selectedPageIds={selectedPageIds}
          selectedPagesMap={selectedPagesMap}
          togglePage={togglePage}
          orgGrantMode={orgGrantMode}
          selectedOrgIds={selectedOrgIds}
          selectedTeamIds={selectedTeamIds}
        />
      )}
    </div>
  )
}
