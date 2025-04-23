import {type NodeViewProps} from '@tiptap/react'
import graphql from 'babel-plugin-relay/macro'
import type {GraphQLError} from 'graphql'
import {marked} from 'marked'
import {getRequest} from 'relay-runtime'
import Ellipsis from '../../../components/Ellipsis/Ellipsis'
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

marked.use({
  gfm: true,
  breaks: true,
  renderer: {
    listitem({text}) {
      // TipTap does not like empty list items
      const nextItem = text || '<p></p>'
      return `<li>${nextItem}</li>`
    }
  }
})
export interface ExecutionResult<TData = any, TExtensions = any> {
  incremental?: ReadonlyArray<{
    path?: ReadonlyArray<string | number>
    items?: TData | null
    errors?: ReadonlyArray<GraphQLError>
  }>
  data?: TData | null
  errors?: ReadonlyArray<GraphQLError>
  hasNext?: boolean
  extensions?: TExtensions
  label?: string
  path?: ReadonlyArray<string | number>
  items?: TData | null
}

const queryNode = graphql`
  query InsightsBlockEditingQuery($meetingIds: [ID!]!, $prompt: String!) {
    viewer {
      pageInsights(meetingIds: $meetingIds, prompt: $prompt) @stream_HACK
    }
  }
`

export const InsightsBlockEditing = (props: NodeViewProps) => {
  const {editor, node, updateAttributes} = props
  const attrs = node.attrs as InsightsBlockAttrs
  const {id: blockId, after, before, meetingTypes, teamIds, meetingIds, hash, title, prompt} = attrs
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
    let first = true
    const request = getRequest(queryNode).params
    const {id, name} = request
    let buffer = `# ${title}\n`
    const sink = {
      error: (err: unknown) => {
        console.error(err)
        atmosphere.eventEmitter.emit('addSnackbar', {
          key: 'insightsBlockGenError',
          message: (err as Error).message || 'Error generating insights',
          autoDismiss: 5
        })
        return
      },
      next: (val: ExecutionResult) => {
        try {
          const chunk = val?.incremental?.flatMap((i) => i.items).join('')
          if (!chunk) {
            const error = val?.incremental?.flatMap((e) => e.errors)[0] || val?.errors?.[0]
            if (error) {
              sink.error(error)
            }
            return
          }
          const freshInsightsNode = editor.$node('insightsBlock', {id: blockId})
          if (!freshInsightsNode) return
          if (first) {
            first = false
            updateAttributes({editing: false, hash: resultsHash})
          }
          buffer += chunk
          const bufferFragment = marked.parse(buffer)
          editor.commands.insertContentAt(
            {from: freshInsightsNode.from, to: freshInsightsNode.to - 1},
            bufferFragment
          )
        } catch (e) {
          sink.error('message' in (e as Error) ? e : new Error((e as string) || 'Unkonwn error'))
        }
      },
      complete: () => {
        onCompleted()
      }
    }

    atmosphere.subscriptionClient.subscribe(
      {
        operationName: name,
        docId: id,
        query: '',
        variables: {
          meetingIds,
          prompt
        }
      } as any,
      sink
    )
  }
  return (
    <div contentEditable={false}>
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
          {submitting ? <Ellipsis /> : undefined}
        </Button>
      </div>
    </div>
  )
}
