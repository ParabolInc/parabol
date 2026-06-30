import TuneIcon from '@mui/icons-material/Tune'
import type {Editor, JSONContent} from '@tiptap/core'
import {useState} from 'react'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import UpsertTeamPromptResponseMutation from '../../../mutations/UpsertTeamPromptResponseMutation'
import useGenerateInspirationItemsMutation from '../../../mutations/useGenerateInspirationItemsMutation'
import {Button} from '../../../ui/Button/Button'
import {Dialog} from '../../../ui/Dialog/Dialog'
import {DialogActions} from '../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../ui/Dialog/DialogTitle'
import {Tooltip} from '../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../ui/Tooltip/TooltipTrigger'
import Ellipsis from '../../Ellipsis/Ellipsis'
import InspirationItemCard from './InspirationItemCard'

interface InspirationItemData {
  id: string
  title: string | null
  content: JSONContent
}

interface ViewerResponse {
  id: string
  content: string
  plaintextContent: string
}

interface Props {
  meetingId: string
  service: string
  searchQuery: string
  initialItems: readonly {id: string; title?: string | null; content: string}[]
  viewerResponse: ViewerResponse | null
}

// content arrives as a stringified tiptap doc
const parseContent = (raw: string): JSONContent => {
  try {
    return JSON.parse(raw)
  } catch {
    return {type: 'doc', content: []}
  }
}

const InspirationItemsPanel = (props: Props) => {
  const {meetingId, service, searchQuery, initialItems, viewerResponse} = props
  const atmosphere = useAtmosphere()
  const [items, setItems] = useState<InspirationItemData[]>(() =>
    initialItems.map(({id, title, content}) => ({
      id,
      title: title ?? null,
      content: parseContent(content)
    }))
  )
  const [userPrompt, setUserPrompt] = useState('')
  const [promptOpen, setPromptOpen] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [generateInspirationItems, submitting] = useGenerateInspirationItemsMutation()
  const {
    onError: onResponseError,
    onCompleted: onResponseCompleted,
    submitMutation: submitResponse,
    submitting: addingToResponse
  } = useMutationProps()

  const onGenerate = () => {
    if (submitting) return
    setError(null)
    generateInspirationItems({
      variables: {input: {meetingId, service, searchQuery, userPrompt: userPrompt.trim() || null}},
      onError: setError,
      onCompleted: (res) => {
        const generated = res.generateInspirationItems?.inspirationItems ?? []
        setItems(
          generated.map(({id, title, content}) => ({
            id,
            title: title ?? null,
            content: parseContent(content)
          }))
        )
      }
    })
  }

  const onAddToResponse = (editor: Editor) => {
    if (addingToResponse) return
    let existingContent: JSONContent[] = []
    if (viewerResponse?.content) {
      try {
        const existing = JSON.parse(viewerResponse.content) as JSONContent
        existingContent = existing.content ?? []
      } catch {
        existingContent = []
      }
    }
    const itemBlocks = editor.getJSON().content ?? []
    const content = JSON.stringify({
      type: 'doc',
      content: [...existingContent, ...itemBlocks]
    })
    const plaintextContent = [viewerResponse?.plaintextContent, editor.getText()]
      .filter(Boolean)
      .join('\n')
    submitResponse()
    UpsertTeamPromptResponseMutation(
      atmosphere,
      {teamPromptResponseId: viewerResponse?.id, meetingId, content},
      {plaintextContent, onError: onResponseError, onCompleted: onResponseCompleted}
    )
  }

  return (
    <div className='flex flex-col gap-2 px-4 pb-4'>
      <div className='flex gap-2'>
        <Button
          variant='secondary'
          size='md'
          className='flex-1'
          disabled={submitting}
          onClick={onGenerate}
        >
          {submitting ? <Ellipsis /> : 'Draft my response from this work'}
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='secondary'
              shape='circle'
              aria-label='Customize instructions'
              data-dirty={userPrompt.trim() ? '' : undefined}
              className='h-9 w-9 shrink-0 p-0 data-dirty:ring-2 data-dirty:ring-sky-300'
              disabled={submitting}
              onClick={() => setPromptOpen(true)}
            >
              <TuneIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Customize how the AI drafts your response</TooltipContent>
        </Tooltip>
      </div>
      <Dialog isOpen={promptOpen} onClose={() => setPromptOpen(false)}>
        <DialogContent className='z-10'>
          <DialogTitle className='mb-4'>Custom instructions</DialogTitle>
          <textarea
            autoFocus
            className='min-h-32 w-full resize-y rounded-md border border-slate-300 p-2 text-slate-700 text-sm focus:border-sky-500 focus:outline-none'
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder='Tell the AI how to draft your response…'
          />
          <DialogActions>
            {userPrompt.trim() && (
              <Button variant='ghost' size='md' onClick={() => setUserPrompt('')}>
                Clear
              </Button>
            )}
            <Button variant='secondary' size='md' onClick={() => setPromptOpen(false)}>
              Done
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
      {error && <div className='text-sm text-tomato-500'>{error.message}</div>}
      {items.map((item) => (
        <InspirationItemCard
          key={item.id}
          title={item.title}
          content={item.content}
          onAddToResponse={onAddToResponse}
          responsePlaintext={viewerResponse?.plaintextContent ?? ''}
          disabled={addingToResponse}
        />
      ))}
    </div>
  )
}

export default InspirationItemsPanel
