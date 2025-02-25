import {ExpandMore} from '@mui/icons-material'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type {NodeViewProps} from '@tiptap/core'
import type {MeetingTypeEnum} from '../__generated__/ExportToCSVQuery.graphql'
import type {InsightsBlockAttrs} from '../tiptap/extensions/imageBlock/InsightsBlock'
import {Checkbox} from '../ui/Checkbox/Checkbox'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'

interface Props {
  updateAttributes: NodeViewProps['updateAttributes']
  attrs: InsightsBlockAttrs
}

export const MeetingTypeToReadable = {
  action: 'Team Check-in',
  poker: 'Sprint Poker',
  retrospective: 'Retrospective',
  teamPrompt: 'Standup'
} satisfies Record<MeetingTypeEnum, string>

export const MeetingTypePickerCombobox = (props: Props) => {
  const {updateAttributes, attrs} = props
  const {meetingTypes} = attrs
  const toggleSelectedTeamId = (meetingType: MeetingTypeEnum) => {
    const nextTypes = meetingTypes.includes(meetingType)
      ? meetingTypes.filter((curMeetingType) => curMeetingType !== meetingType)
      : [...meetingTypes, meetingType]
    updateAttributes({meetingTypes: nextTypes})
  }
  const label =
    meetingTypes.map((type) => MeetingTypeToReadable[type]).join(', ') || 'Meeting types...'
  return (
    <Menu
      trigger={
        <div className='group flex cursor-pointer items-center justify-between rounded-md bg-white'>
          <div className='p-2 leading-4'>{label}</div>
          <div className='flex items-center'>
            <ExpandMore className='text-slate-600 transition-transform group-data-[state=open]:rotate-180' />
          </div>
        </div>
      }
    >
      <MenuContent align='end' sideOffset={4}>
        {Object.entries(MeetingTypeToReadable).map((entry) => {
          const [meetingType, label] = entry as [MeetingTypeEnum, string]
          const checked = meetingTypes.includes(meetingType)
          return (
            <DropdownMenu.Item
              key={meetingType}
              asChild
              onSelect={(e) => {
                e.preventDefault()
              }}
              onClick={() => {
                toggleSelectedTeamId(meetingType)
              }}
            >
              <div className='mx-1 flex outline-hidden'>
                <div
                  data-highlighted={checked}
                  className={
                    'group flex w-full cursor-pointer items-center space-x-2 rounded-md px-3 py-2 text-sm leading-8 text-slate-700 outline-hidden hover:bg-slate-200! hover:text-slate-900 focus:bg-slate-200 data-highlighted:bg-slate-100 data-highlighted:text-slate-900'
                  }
                >
                  <div className='flex size-7 items-center justify-center rounded-sm bg-slate-200 group-hover:bg-slate-300 group-data-highlighted:bg-slate-300'>
                    <Checkbox checked={checked} />
                  </div>
                  <div className='flex flex-col text-sm select-none'>
                    <span>{label}</span>
                  </div>
                </div>
              </div>
            </DropdownMenu.Item>
          )
        })}
      </MenuContent>
    </Menu>
  )
}
