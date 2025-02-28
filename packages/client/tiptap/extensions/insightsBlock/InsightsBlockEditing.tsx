import {NodePos, type NodeViewProps} from '@tiptap/react'
import graphql from 'babel-plugin-relay/macro'
import type {InsightsBlockEditingQuery} from '../../../__generated__/InsightsBlockEditingQuery.graphql'
import {MeetingDatePicker} from '../../../components/MeetingDatePicker'
import {MeetingTypePickerCombobox} from '../../../components/MeetingTypePickerCombobox'
import {SpecificMeetingPickerRoot} from '../../../components/SpecificMeetingPickerRoot'
import {TeamPickerComboboxRoot} from '../../../components/TeamPickerComboboxRoot'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import {Button} from '../../../ui/Button/Button'
import type {InsightsBlockAttrs} from './InsightsBlock'

const queryNode = graphql`
  query InsightsBlockEditingQuery($meetingIds: [ID!]!) {
    viewer {
      pageInsights(meetingIds: $meetingIds, responseFormat: html)
    }
  }
`

export const InsightsBlockEditing = (props: NodeViewProps) => {
  const {editor, node, updateAttributes} = props
  const attrs = node.attrs as InsightsBlockAttrs
  const {after, before, meetingTypes, teamIds, meetingIds} = attrs
  const canQueryMeetings = teamIds.length > 0 && meetingTypes.length > 0 && after && before
  const {submitting, submitMutation, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()
  const disabled = submitting || meetingIds.length < 1

  const generateInsights = async () => {
    if (disabled) return
    submitMutation()
    const res = await atmosphere.fetchQuery<InsightsBlockEditingQuery>(queryNode, {meetingIds})
    if (!res) {
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: 'insightsBlockGenError',
        message: 'Error generating insights',
        autoDismiss: 5
      })
      return
    }
    const {viewer} = res
    const {pageInsights} = viewer
    onCompleted()
    const nodePos = new NodePos(editor.view.state.selection.$anchor, editor)
    const insightNode = nodePos.closest('insightsBlock')
    if (!insightNode) return
    insightNode.content = pageInsights
    updateAttributes({editing: false})
  }
  return (
    <>
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
      </div>
      {canQueryMeetings && (
        <SpecificMeetingPickerRoot updateAttributes={updateAttributes} attrs={attrs} />
      )}
      <div className='flex justify-end p-4'>
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
