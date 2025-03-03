import {NodeViewWrapper, type NodeViewProps} from '@tiptap/react'
import {MeetingDatePicker} from '../../../components/MeetingDatePicker'
import {MeetingTypePickerCombobox} from '../../../components/MeetingTypePickerCombobox'
import {SpecificMeetingPickerRoot} from '../../../components/SpecificMeetingPickerRoot'
import {TeamPickerComboboxRoot} from '../../../components/TeamPickerComboboxRoot'
import {Button} from '../../../ui/Button/Button'
import type {InsightsBlockAttrs} from '../imageBlock/InsightsBlock'
export const InsightsBlockView = (props: NodeViewProps) => {
  const {node, updateAttributes} = props
  const attrs = node.attrs as InsightsBlockAttrs
  const {title, after, before, meetingTypes, teamIds} = attrs
  const canQueryMeetings = teamIds.length > 0 && meetingTypes.length > 0 && after && before
  return (
    <NodeViewWrapper>
      <div className='m-0 w-full p-0 text-slate-900'>
        <div className='flex flex-col rounded-sm bg-slate-200 p-4'>
          <input
            className='bg-inherit p-4 text-lg ring-0 outline-0'
            onChange={(e) => {
              updateAttributes({title: e.target.value})
            }}
            value={title}
          />
          <div className='grid grid-cols-[auto_1fr] gap-4 p-4'>
            {/* Row 1 */}
            <label className='self-center font-semibold'>Teams</label>
            <TeamPickerComboboxRoot updateAttributes={updateAttributes} attrs={attrs} />
            {/* Row 2 */}
            <label className='self-center font-semibold'>Type</label>
            <MeetingTypePickerCombobox updateAttributes={updateAttributes} attrs={attrs} />
            {/* Row 3 */}
            <label className='self-center font-semibold'>Meetings started between</label>
            <MeetingDatePicker updateAttributes={updateAttributes} attrs={attrs} />
            <div></div>
          </div>
          {canQueryMeetings && (
            <SpecificMeetingPickerRoot updateAttributes={updateAttributes} attrs={attrs} />
          )}
          <div className='flex justify-end p-4'>
            <Button variant='secondary' shape='pill' size='md'>
              Generate Insights
            </Button>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  )
}
