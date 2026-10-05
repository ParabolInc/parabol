import type {Editor, JSONContent} from '@tiptap/core'
import {useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {useEffect, useState} from 'react'
import {Check as CheckIcon} from '~/ui/icons'
import {Button} from '../../../ui/Button/Button'
import {TipTapEditor} from '../../TipTapEditor/TipTapEditor'
import {TiptapLinkExtension} from '../../TipTapEditor/TiptapLinkExtension'
import hasContentToAdd from './hasContentToAdd'
import InspirationDestinationChip from './InspirationDestinationChip'
import type {WorkDrawerPrompt} from './WorkDrawerConsumeContext'

interface Props {
  itemId: string
  title: string | null
  content: JSONContent
  prompt: WorkDrawerPrompt
  isAdded: boolean
  disabled: boolean
  onEditorChange: (itemId: string, editor: Editor | null) => void
  onAdd: () => void
}

const InspirationDraftItemCard = (props: Props) => {
  const {itemId, title, content, prompt, isAdded, disabled, onEditorChange, onAdd} = props
  const [isEmpty, setIsEmpty] = useState(false)
  const editor = useEditor({
    content,
    extensions: [
      StarterKit.configure({link: false}),
      TiptapLinkExtension.configure({openOnClick: false})
    ],
    editorProps: {attributes: {'aria-label': title ?? 'Drafted answer'}},
    onUpdate: ({editor}) => setIsEmpty(!hasContentToAdd(editor))
  })
  useEffect(() => {
    if (!editor) return
    setIsEmpty(!hasContentToAdd(editor))
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
        className='[&_a]:no-underline! [&_a]:hover:underline! max-h-48 overflow-auto rounded-md border border-hairline-field p-2 text-[13px] text-fg-primary leading-[22px] focus-within:border-accent [&_a]:whitespace-nowrap [&_a]:rounded [&_a]:bg-surface-well [&_a]:px-1.5 [&_a]:py-px [&_a]:font-medium [&_a]:text-xs'
      />
      <div className='flex items-center justify-end'>
        {isAdded ? (
          <div className='flex h-8 items-center gap-1 px-2 font-semibold text-[13px] text-jade-600'>
            <CheckIcon className='h-4 w-4' />
            Added
          </div>
        ) : (
          <Button
            variant='secondary'
            size='sm'
            disabled={disabled || isEmpty}
            onClick={() => {
              if (!hasContentToAdd(editor)) return
              onAdd()
            }}
          >
            Add to response
          </Button>
        )}
      </div>
    </div>
  )
}

export default InspirationDraftItemCard
