import CheckIcon from '@mui/icons-material/Check'
import type {JSONContent} from '@tiptap/core'
import {useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {useState} from 'react'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import CreateReflectionMutation from '../../../mutations/CreateReflectionMutation'
import {Button} from '../../../ui/Button/Button'
import {TipTapEditor} from '../../TipTapEditor/TipTapEditor'
import {TiptapLinkExtension} from '../../TipTapEditor/TiptapLinkExtension'
import {useWorkDrawerConsume} from './WorkDrawerConsumeContext'

interface Props {
  meetingId: string
  promptId: string | null
  title: string | null
  content: JSONContent
}

const RetroInspirationItemCard = (props: Props) => {
  const {meetingId, promptId, title, content} = props
  const atmosphere = useAtmosphere()
  const consume = useWorkDrawerConsume()
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()
  // Local flag for immediate feedback; the derived `added` below keeps state across refresh.
  const [justAdded, setJustAdded] = useState(false)
  const editor = useEditor({
    content,
    extensions: [
      StarterKit.configure({link: false}),
      TiptapLinkExtension.configure({openOnClick: false})
    ]
  })

  const prompt = consume.mode === 'retro' ? consume.getReflectPrompt(promptId) : null

  if (!editor) return null

  const alreadyAdded =
    consume.mode === 'retro' && consume.isReflectionAdded(promptId, editor.getText())
  const added = justAdded || alreadyAdded

  const onAddReflection = () => {
    if (submitting || added || !promptId) return
    submitMutation()
    const input = {
      content: JSON.stringify(editor.getJSON()),
      meetingId,
      promptId,
      sortOrder: consume.mode === 'retro' ? consume.getNextReflectionSortOrder(promptId) : 0
    }
    CreateReflectionMutation(
      atmosphere,
      {input},
      {
        onError,
        onCompleted: (res, errors) => {
          onCompleted(res, errors)
          if (!errors) setJustAdded(true)
        }
      }
    )
  }

  return (
    <div className='flex flex-col gap-2 rounded-card bg-surface-card p-3 shadow-card'>
      {title && <div className='font-semibold text-fg-primary text-sm'>{title}</div>}
      <TipTapEditor
        editor={editor}
        className='max-h-48 overflow-auto rounded-md border border-hairline-field p-2 text-fg-primary focus-within:border-accent'
      />
      <div className='flex items-center justify-between gap-2'>
        {prompt ? (
          <div className='flex min-w-0 items-center gap-1.5'>
            <div
              className='h-2.5 w-2.5 shrink-0 rounded-full'
              style={{backgroundColor: prompt.groupColor}}
            />
            <span className='truncate text-fg-secondary text-xs'>{prompt.question}</span>
          </div>
        ) : (
          <div />
        )}
        {added ? (
          <div className='flex shrink-0 items-center gap-1 px-3 py-1 font-semibold text-forest-500 text-sm'>
            <CheckIcon className='h-4 w-4' />
            Added
          </div>
        ) : (
          <Button
            variant='secondary'
            size='sm'
            shape='pill'
            className='shrink-0'
            disabled={submitting || editor.isEmpty || !promptId}
            onClick={onAddReflection}
          >
            Add reflection
          </Button>
        )}
      </div>
    </div>
  )
}

export default RetroInspirationItemCard
