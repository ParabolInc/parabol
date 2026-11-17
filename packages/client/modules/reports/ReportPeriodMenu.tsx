import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Popover from '@radix-ui/react-popover'
import {Fragment, useRef, useState} from 'react'
import {Check, DateRange, ExpandMore} from '~/ui/icons'
import {cn} from '../../ui/cn'
import {Menu} from '../../ui/Menu/Menu'
import {MenuContent} from '../../ui/Menu/MenuContent'
import {MENU_ITEM, MenuItem} from '../../ui/Menu/MenuItem'
import {MenuSeparator} from '../../ui/Menu/MenuSeparator'
import {
  describeCustomRange,
  describeReportPagePeriod,
  describeReportPreset
} from './describeReportPagePeriod'
import ReportCustomRangePicker from './ReportCustomRangePicker'
import {
  REPORT_PAGE_PRESETS,
  type ReportPagePeriod,
  type ReportPagePreset
} from './reportPeriodParam'
import {REPORT_PERIOD_LABELS} from './reportSpecLabels'

interface Props {
  period: ReportPagePeriod
  onChange: (period: ReportPagePeriod) => void
  orgCreatedAt: string
}

const PRESET_GROUPS: ReportPagePreset[][] = [
  ['LAST_7_DAYS', 'LAST_30_DAYS'],
  ['LAST_3_MONTHS', 'LAST_6_MONTHS', 'LAST_12_MONTHS', 'ALL_TIME']
]
const ReportPeriodMenu = ({period, onChange, orgCreatedAt}: Props) => {
  const [isCustomOpen, setIsCustomOpen] = useState(false)
  const isCustomRequestedRef = useRef(false)
  const customLabel = describeCustomRange(period)
  const onValueChange = (value: string) => {
    const preset = REPORT_PAGE_PRESETS.find((key) => key === value)
    if (preset) onChange({preset})
  }
  return (
    <Popover.Root open={isCustomOpen} onOpenChange={setIsCustomOpen}>
      <Popover.Anchor asChild>
        <div className='inline-flex'>
          <Menu
            trigger={
              <button
                type='button'
                className='inline-flex h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-hairline-strong pr-1.5 pl-2.5 font-semibold text-fg-primary text-sm hover:bg-surface-hover data-[state=open]:bg-surface-hover'
              >
                <DateRange className='text-[18px] text-fg-secondary' />
                {describeReportPagePeriod(period)}
                <ExpandMore className='text-[20px] text-fg-secondary' />
              </button>
            }
          >
            <MenuContent
              align='end'
              sideOffset={4}
              className='max-h-none min-w-[300px]'
              onCloseAutoFocus={(event) => {
                // the custom range opens as the menu closes, so focus belongs there, not on the button
                if (isCustomRequestedRef.current) event.preventDefault()
                isCustomRequestedRef.current = false
              }}
            >
              <DropdownMenu.RadioGroup value={period.preset ?? ''} onValueChange={onValueChange}>
                {PRESET_GROUPS.map((presets, groupIdx) => (
                  <Fragment key={presets[0]}>
                    {groupIdx > 0 && <MenuSeparator />}
                    {presets.map((preset) => (
                      <DropdownMenu.RadioItem
                        key={preset}
                        value={preset}
                        className={cn(MENU_ITEM, 'cursor-pointer gap-4 py-1.5')}
                      >
                        <span className='flex-1'>{REPORT_PERIOD_LABELS[preset]}</span>
                        <span className='text-fg-muted text-xs'>
                          {describeReportPreset(preset, orgCreatedAt)}
                        </span>
                        <DropdownMenu.ItemIndicator
                          forceMount
                          className='flex data-[state=unchecked]:invisible'
                        >
                          <Check className='text-[18px] text-fg-secondary' />
                        </DropdownMenu.ItemIndicator>
                      </DropdownMenu.RadioItem>
                    ))}
                  </Fragment>
                ))}
              </DropdownMenu.RadioGroup>
              <MenuSeparator />
              <MenuItem
                className='gap-4 py-1.5'
                onSelect={() => {
                  isCustomRequestedRef.current = true
                  setIsCustomOpen(true)
                }}
              >
                <span className='flex-1'>{customLabel ? 'Custom range' : 'Custom range…'}</span>
                {customLabel && <span className='text-fg-muted text-xs'>{customLabel}</span>}
                <Check
                  className={cn('text-[18px] text-fg-secondary', !customLabel && 'invisible')}
                />
              </MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          align='end'
          sideOffset={4}
          collisionPadding={8}
          aria-label='Custom range'
          className='z-10 rounded-md border border-hairline bg-surface-modal shadow-[var(--shadow-card-raised)] data-[side=bottom]:animate-slide-down'
        >
          <ReportCustomRangePicker
            period={period}
            orgCreatedAt={orgCreatedAt}
            onApply={(customPeriod) => {
              onChange(customPeriod)
              setIsCustomOpen(false)
            }}
            onCancel={() => setIsCustomOpen(false)}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default ReportPeriodMenu
