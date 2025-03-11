import {type NodeViewProps} from '@tiptap/react'
import graphql from 'babel-plugin-relay/macro'
import type {InsightsBlockEditingQuery} from '../../../__generated__/InsightsBlockEditingQuery.graphql'
import {MeetingDatePicker} from '../../../components/MeetingDatePicker'
import {MeetingTypePickerCombobox} from '../../../components/MeetingTypePickerCombobox'
import {SpecificMeetingPickerRoot} from '../../../components/SpecificMeetingPickerRoot'
import {TeamPickerComboboxRoot} from '../../../components/TeamPickerComboboxRoot'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import {Button} from '../../../ui/Button/Button'
import {quickHash} from '../../../utils/quickHash'
import type {InsightsBlockAttrs} from './InsightsBlock'
import {InsightsBlockPromptRoot} from './InsightsBlockPromptRoot'

const queryNode = graphql`
  query InsightsBlockEditingQuery($meetingIds: [ID!]!, $prompt: String!) {
    viewer {
      pageInsights(meetingIds: $meetingIds, prompt: $prompt)
    }
  }
`

export const InsightsBlockEditing = (props: NodeViewProps) => {
  const {editor, node, updateAttributes} = props
  const attrs = node.attrs as InsightsBlockAttrs
  const {id, after, before, meetingTypes, teamIds, meetingIds, hash, title, prompt} = attrs
  const canQueryMeetings = teamIds.length > 0 && meetingTypes.length > 0 && after && before
  const {submitting, submitMutation, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()
  const disabled = submitting || meetingIds.length < 1

  const generateInsights = async () => {
    if (disabled) return
    const resultsHash = await quickHash([...meetingIds, prompt])
    if (resultsHash === hash) {
      updateAttributes({editing: false})
      return
    }
    submitMutation()
    const res = await atmosphere.fetchQuery<InsightsBlockEditingQuery>(queryNode, {
      meetingIds,
      prompt
    })
    onCompleted()
    if (res instanceof Error) {
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: 'insightsBlockGenError',
        message: res.message || 'Error generating insights',
        autoDismiss: 5
      })
      return
    }
    const {viewer} = res
    const {pageInsights} = viewer
    const insightsNode = editor.$node('insightsBlock', {id})!
    editor.commands.insertContentAt(
      {
        from: insightsNode.from,
        to: insightsNode.to - 1
      },
      `# ${title}\n` + pageInsights
    )
    updateAttributes({editing: false, hash: resultsHash})
  }
  return (
    <>
      <input
        className='bg-inherit p-4 text-lg ring-0 outline-0'
        onChange={(e) => {
          updateAttributes({title: e.target.value})
        }}
        value={title}
      />
      <div className='grid grid-cols-[auto_1fr] gap-4 py-4'>
        {/* Row 1 */}
        <label className='self-center font-semibold'>Teams</label>
        <TeamPickerComboboxRoot updateAttributes={updateAttributes} attrs={attrs} />
        {/* Row 2 */}
        <label className='self-center font-semibold'>Type</label>
        <MeetingTypePickerCombobox updateAttributes={updateAttributes} attrs={attrs} />
        {/* Row 3 */}
        <label className='self-center font-semibold'>Meetings started between</label>
        <MeetingDatePicker updateAttributes={updateAttributes} attrs={attrs} />
      </div>
      {canQueryMeetings && (
        <SpecificMeetingPickerRoot updateAttributes={updateAttributes} attrs={attrs} />
      )}
      <InsightsBlockPromptRoot updateAttributes={updateAttributes} attrs={attrs} />
      <div className='flex justify-end p-4 select-none'>
        <Button
          variant='secondary'
          shape='pill'
          size='md'
          onClick={generateInsights}
          disabled={disabled}
        >
          Generate Insights
        </Button>
      </div>
    </>
  )
}
