import type {NodeViewProps} from '@tiptap/core'
import dayjs from 'dayjs'
import {DayPicker} from 'react-day-picker'
import type {InsightsBlockAttrs} from '../tiptap/extensions/imageBlock/InsightsBlock'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'

interface Props {
  updateAttributes: NodeViewProps['updateAttributes']
  attrs: InsightsBlockAttrs
}

export const MeetingDatePicker = (props: Props) => {
  const {updateAttributes, attrs} = props
  const {startAt, endAt} = attrs
  const dateRangeLabel = `${dayjs(startAt).format('MMM D, YYYY')} - ${dayjs(endAt).format('MMM D, YYYY')}`

  return (
    <Menu
      className='data-[side=bottom]:animate-slide-down data-[side=top]:animate-slide-up'
      trigger={
        <div className='group flex cursor-pointer items-center justify-between rounded-md bg-white'>
          <div className='p-2 leading-4'>{dateRangeLabel}</div>
        </div>
      }
    >
      <MenuContent>
        <div className='z-10 overflow-auto rounded-md bg-white py-1 shadow-lg outline-hidden in-data-[placement="bottom-start"]:animate-slide-down in-data-[placement="top-start"]:animate-slide-up'>
          <div className='py-2'>
            <DayPicker
              mode='range'
              selected={{from: new Date(startAt), to: new Date(endAt)}}
              disabled={{after: new Date()}}
              onSelect={(newSelected) => {
                updateAttributes({
                  startAt: newSelected?.from?.toISOString(),
                  endAt: newSelected?.to?.toISOString()
                })
              }}
            />
          </div>
        </div>
      </MenuContent>
    </Menu>
  )
}
