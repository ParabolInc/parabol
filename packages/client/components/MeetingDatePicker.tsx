import DateRangeIcon from '@mui/icons-material/DateRange'
import type {NodeViewProps} from '@tiptap/core'
import dayjs from 'dayjs'
import {DayPicker} from 'react-day-picker'
import type {InsightsBlockAttrs} from '../tiptap/extensions/insightsBlock/InsightsBlock'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuLabelTrigger} from '../ui/Menu/MenuLabelTrigger'

interface Props {
  updateAttributes: NodeViewProps['updateAttributes']
  attrs: InsightsBlockAttrs
}

export const MeetingDatePicker = (props: Props) => {
  const {updateAttributes, attrs} = props
  const {after, before} = attrs
  const dateRangeLabel = `${dayjs(after).format('MMM D, YYYY')} - ${dayjs(before).format('MMM D, YYYY')}`

  return (
    <Menu
      trigger={
        <MenuLabelTrigger icon={<DateRangeIcon className='text-slate-600' />}>
          {dateRangeLabel}
        </MenuLabelTrigger>
      }
    >
      <MenuContent align='end' sideOffset={4} className='max-h-80'>
        <DayPicker
          mode='range'
          selected={{from: new Date(after), to: new Date(before)}}
          disabled={{after: new Date()}}
          onSelect={(newSelected) => {
            updateAttributes({
              after: newSelected?.from?.toISOString(),
              before: newSelected?.to?.toISOString()
            })
          }}
        />
      </MenuContent>
    </Menu>
  )
}
