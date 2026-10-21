import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {Add} from '~/ui/icons'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import {Menu} from '../../ui/Menu/Menu'
import {MenuContent} from '../../ui/Menu/MenuContent'
import {MenuItem} from '../../ui/Menu/MenuItem'
import {MenuSubContent} from '../../ui/Menu/MenuSubContent'
import {MenuSubTrigger} from '../../ui/Menu/MenuSubTrigger'
import {
  addBreakdownEdits,
  addFilterEdits,
  compareEdits,
  limitEdits,
  type ReportSpecEditOption,
  type ReportTeam,
  sortEdits
} from './reportSpecEdits'

interface Props {
  spec: ReportSpec
  teams: readonly ReportTeam[]
  onChange: (spec: ReportSpec) => void
}

const ReportSpecAddMenu = ({spec, teams, onChange}: Props) => {
  const unpicked = (options: ReportSpecEditOption[]) =>
    options.filter(({isSelected}) => !isSelected)
  const groups = [
    {label: 'Breakdown', options: addBreakdownEdits(spec)},
    {label: 'Compare to', options: spec.compareTo ? [] : unpicked(compareEdits(spec))},
    {label: 'Sort', options: spec.sort ? [] : unpicked(sortEdits(spec))},
    {label: 'Limit', options: spec.limit ? [] : unpicked(limitEdits(spec))}
  ].filter(({options}) => options.length > 0)
  const filterGroups = addFilterEdits(spec, teams)
  if (groups.length === 0 && filterGroups.length === 0) return null
  const toItems = (options: ReportSpecEditOption[]) =>
    options.map(({key, label, spec: nextSpec}) => (
      <MenuItem key={key} onSelect={() => onChange(nextSpec)}>
        {label}
      </MenuItem>
    ))
  return (
    <Menu
      trigger={
        <button
          type='button'
          className='inline-flex h-8 cursor-pointer items-center gap-1 rounded-md pr-2.5 pl-1.5 font-semibold text-[13px] text-fg-secondary hover:bg-surface-hover data-[state=open]:bg-surface-hover'
        >
          <Add className='text-[18px]' />
          Add
        </button>
      }
    >
      <MenuContent align='start' sideOffset={4}>
        {filterGroups.length > 0 && (
          <DropdownMenu.Sub>
            <MenuSubTrigger>Filter</MenuSubTrigger>
            <MenuSubContent>
              {filterGroups.map(({dimension, label, options}) => (
                <DropdownMenu.Sub key={dimension}>
                  <MenuSubTrigger>{label}</MenuSubTrigger>
                  <MenuSubContent className='max-h-80'>{toItems(options)}</MenuSubContent>
                </DropdownMenu.Sub>
              ))}
            </MenuSubContent>
          </DropdownMenu.Sub>
        )}
        {groups.map(({label, options}) => (
          <DropdownMenu.Sub key={label}>
            <MenuSubTrigger>{label}</MenuSubTrigger>
            <MenuSubContent className='max-h-80'>{toItems(options)}</MenuSubContent>
          </DropdownMenu.Sub>
        ))}
      </MenuContent>
    </Menu>
  )
}

export default ReportSpecAddMenu
