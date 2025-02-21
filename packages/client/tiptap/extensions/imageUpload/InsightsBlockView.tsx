// import {DatePicker} from '@mui/x-date-pickers'
import {NodeViewWrapper, type NodeViewProps} from '@tiptap/react'
import {MeetingTypePickerCombobox} from '../../../components/MeetingTypePickerCombobox'
import {TeamPickerComboboxRoot} from '../../../components/TeamPickerComboboxRoot'
import type {InsightsBlockAttrs} from '../imageBlock/InsightsBlock'
export const InsightsBlockView = (props: NodeViewProps) => {
  const {node, updateAttributes} = props
  const attrs = node.attrs as InsightsBlockAttrs
  const {title} = attrs
  return (
    <NodeViewWrapper>
      <div className='m-0 p-0 text-slate-900'>
        <div className='flex cursor-pointer flex-col rounded-sm bg-slate-200 p-4'>
          <input
            className='bg-inherit p-4 text-lg ring-0 outline-0'
            onChange={(e) => {
              updateAttributes({title: e.target.value})
            }}
            value={title}
          />
          <div className='grid w-96 grid-cols-[repeat(2,minmax(256px,1fr))] gap-4 p-4'>
            {/* Row 1 */}
            <label className='self-center font-semibold'>Teams</label>
            <TeamPickerComboboxRoot updateAttributes={updateAttributes} attrs={attrs} />
            {/* Row 2 */}
            <label className='self-center font-semibold'>Type</label>
            <MeetingTypePickerCombobox updateAttributes={updateAttributes} attrs={attrs} />

            {/* Row 3 */}
            <label className='self-center font-semibold'>Meetings started between</label>
            {/* <DatePicker
              label={`Meeting Start Date`}
              value={startValue}
              onChange={(date) => handleChangeStart(date, startValue)}
              format='MMMM D, YYYY'
              sx={customStyles}
            /> */}
            <select className='rounded border p-2'>
              <option>Yes</option>
              <option>No</option>
              <option>Maybe</option>
            </select>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  )
}
