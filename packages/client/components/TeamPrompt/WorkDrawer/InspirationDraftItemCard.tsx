import type {Editor, JSONContent} from '@tiptap/core'
import {useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {useEffect, useState} from 'react'
import {Check as CheckIcon} from '~/ui/icons'
import {Button} from '../../../ui/Button/Button'
import {TipTapEditor} from '../../TipTapEditor/TipTapEditor'
import {TiptapLinkExtension} from '../../TipTapEditor/TiptapLinkExtension'
import InspirationDestinationChip from './InspirationDestinationChip'
import type {WorkDrawerPrompt} from './WorkDrawerConsumeContext'

interface Props {
  itemId: string
  title: string | null
  content: JSONContent
  prompt: WorkDrawerPrompt
  source: string
  isAdded: boolean
  disabled: boolean
  onEditorChange: (itemId: string, editor: Editor | null) => void
  onAdd: () => void
}

const InspirationDraftItemCard = (props: Props) => {
  const {itemId, title, content, prompt, source, isAdded, disabled, onEditorChange, onAdd} = props
  const [isEmpty, setIsEmpty] = useState(false)
  const editor = useEditor({
    content,
    extensions: [
      StarterKit.configure({link: false}),
      TiptapLinkExtension.configure({openOnClick: false})
    ],
    editorProps: {attributes: {'aria-label': title ?? 'Drafted answer'}},
    onUpdate: ({editor}) => setIsEmpty(editor.isEmpty)
  })
  useEffect(() => {
    if (!editor) return
    setIsEmpty(editor.isEmpty)
    onEditorChange(itemId, editor)
    return () => onEditorChange(itemId, null)
  }, [editor, itemId, onEditorChange])
  if (!editor) return null
  return (
    <div className='flex flex-col gap-2 rounded-card bg-surface-card p-3 shadow-[var(--shadow-card)]'>
      <InspirationDestinationChip question={prompt.question} groupColor={prompt.groupColor} />
      {title && <div className='font-semibold text-fg-primary text-sm'>{title}</div>}
      <TipTapEditor
        editor={editor}
        className='max-h-48 overflow-auto rounded-md border border-hairline-field p-2 text-[13px] text-fg-primary leading-5 focus-within:border-accent'
      />
      <div className='flex items-center justify-between'>
        <span className='text-[11px] text-fg-muted'>{source}</span>
        {isAdded ? (
          <div className='flex h-8 items-center gap-1 px-2 font-semibold text-[13px] text-jade-600'>
            <CheckIcon className='h-4 w-4' />
            Added
          </div>
        ) : (
          <Button variant='secondary' size='sm' disabled={disabled || isEmpty} onClick={onAdd}>
            Add to response
          </Button>
        )}
      </div>
    </div>
  )
}

export default InspirationDraftItemCard
