import type {NodeViewProps} from '@tiptap/core'
import type {MeetingTypeEnum} from '../__generated__/ExportToCSVQuery.graphql'
import type {InsightsBlockAttrs} from '../tiptap/extensions/insightsBlock/InsightsBlock'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItemCheckbox} from '../ui/Menu/MenuItemCheckbox'
import {MenuLabelTrigger} from '../ui/Menu/MenuLabelTrigger'
import {MeetingTypeToReadable} from '../utils/meetings/lookups'

interface Props {
  updateAttributes: NodeViewProps['updateAttributes']
  attrs: InsightsBlockAttrs
}

export const MeetingTypePickerCombobox = (props: Props) => {
  const {updateAttributes, attrs} = props
  const {meetingTypes} = attrs
  const toggleSelectedType = (meetingType: MeetingTypeEnum) => {
    const nextTypes = meetingTypes.includes(meetingType)
      ? meetingTypes.filter((curMeetingType) => curMeetingType !== meetingType)
      : [...meetingTypes, meetingType]
    updateAttributes({meetingTypes: nextTypes})
  }
  const label =
    meetingTypes.map((type) => MeetingTypeToReadable[type]).join(', ') || 'Meeting types...'
  return (
    <Menu trigger={<MenuLabelTrigger>{label}</MenuLabelTrigger>}>
      <MenuContent align='end' sideOffset={4}>
        {Object.entries(MeetingTypeToReadable)
          // Hide Check-in meetings since I didn't build the summarization transform for them
          // Hide Team Health meetings until the meeting type ships
          .filter((entry) => entry[0] !== 'action' && entry[0] !== 'teamHealth')
          .map((entry) => {
            const [meetingType, label] = entry as [MeetingTypeEnum, string]
            const checked = meetingTypes.includes(meetingType)
            return (
              <MenuItemCheckbox
                key={meetingType}
                checked={checked}
                onClick={() => {
                  toggleSelectedType(meetingType)
                }}
              >
                {label}
              </MenuItemCheckbox>
            )
          })}
      </MenuContent>
    </Menu>
  )
}
