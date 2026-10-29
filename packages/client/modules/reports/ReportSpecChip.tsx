import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {Close, ExpandMore} from '~/ui/icons'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import {Menu} from '../../ui/Menu/Menu'
import {MenuContent} from '../../ui/Menu/MenuContent'
import {MENU_ITEM_ICON, MenuItem} from '../../ui/Menu/MenuItem'
import {MenuItemCheckbox} from '../../ui/Menu/MenuItemCheckbox'
import {MenuRadioItem} from '../../ui/Menu/MenuRadioItem'
import {MenuSeparator} from '../../ui/Menu/MenuSeparator'
import type {ReportSpecEditOption} from './reportSpecEdits'
import type {ReportSpecChip as ReportSpecChipData} from './reportSpecLabels'

interface Props {
  chip: ReportSpecChipData
  options: ReportSpecEditOption[]
  isMulti: boolean
  removal: ReportSpec | null
  onChange: (spec: ReportSpec) => void
}

const ReportSpecChip = ({chip, options, isMulti, removal, onChange}: Props) => {
  const selected = options.find(({isSelected}) => isSelected)
  return (
    <Menu
      trigger={
        <button
          type='button'
          className='inline-flex h-8 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-hairline-strong bg-surface-card pr-1 pl-2.5 text-[13px] hover:bg-surface-hover data-[state=open]:bg-surface-hover'
        >
          <span className='text-fg-secondary'>{chip.name}</span>
          <span className='font-semibold'>{chip.value}</span>
          <ExpandMore className='text-[18px] text-fg-secondary' />
        </button>
      }
    >
      <MenuContent align='start' sideOffset={4} className='max-h-80'>
        {isMulti &&
          options.map(({key, label, spec, isSelected, isValid}) => (
            <MenuItemCheckbox
              key={key}
              checked={isSelected}
              disabled={!isValid}
              onCheckedChange={() => onChange(spec)}
            >
              {label}
            </MenuItemCheckbox>
          ))}
        {!isMulti && options.length > 0 && (
          <DropdownMenu.RadioGroup
            value={selected?.key ?? ''}
            onValueChange={(key) => {
              const option = options.find((item) => item.key === key)
              if (option?.isValid && !option.isSelected) onChange(option.spec)
            }}
          >
            {options.map(({key, label, isValid}) => (
              <MenuRadioItem
                key={key}
                value={key}
                disabled={!isValid}
                className='data-disabled:opacity-50'
              >
                {label}
              </MenuRadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        )}
        {removal && (
          <>
            {options.length > 0 && <MenuSeparator />}
            <MenuItem onSelect={() => onChange(removal)}>
              <Close className={MENU_ITEM_ICON} />
              Remove
            </MenuItem>
          </>
        )}
      </MenuContent>
    </Menu>
  )
}

export default ReportSpecChip
