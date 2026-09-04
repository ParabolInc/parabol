import type {Editor, JSONContent} from '@tiptap/core'
import {useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {useEffect} from 'react'
import {Check as CheckIcon} from '~/ui/icons'
import {Button} from '../../../ui/Button/Button'
import {cn} from '../../../ui/cn'
import {TipTapEditor} from '../../TipTapEditor/TipTapEditor'
import {TiptapLinkExtension} from '../../TipTapEditor/TiptapLinkExtension'
import hasContentToAdd from './hasContentToAdd'
import InspirationDestinationChip from './InspirationDestinationChip'
import type {InspirationVariant} from './InspirationPresentationContext'
import type {WorkDrawerPrompt} from './WorkDrawerConsumeContext'

interface Props {
  itemId: string
  title: string | null
  content: JSONContent
  prompt: WorkDrawerPrompt
  source: string
  isAdded: boolean
  isEmpty: boolean
  disabled: boolean
  variant: InspirationVariant
  onEditorChange: (itemId: string, editor: Editor | null) => void
  onEmptyChange: (itemId: string, isEmpty: boolean) => void
  onAdd: () => void
}

const InspirationDraftItemCard = (props: Props) => {
  const {itemId, title, content, prompt, source, isAdded, isEmpty, disabled, variant} = props
  const {onEditorChange, onEmptyChange, onAdd} = props
  const isSheet = variant === 'sheet'
  const editor = useEditor({
    content,
    extensions: [
      StarterKit.configure({link: false}),
      TiptapLinkExtension.configure({openOnClick: false})
    ],
    editorProps: {attributes: {'aria-label': title ?? 'Drafted answer'}},
    onUpdate: ({editor}) => onEmptyChange(itemId, !hasContentToAdd(editor))
  })
  useEffect(() => {
    if (!editor) return
    onEmptyChange(itemId, !hasContentToAdd(editor))
    onEditorChange(itemId, editor)
    return () => onEditorChange(itemId, null)
  }, [editor, itemId, onEditorChange, onEmptyChange])
  if (!editor) return null
  return (
    <div
      className={cn(
        'flex flex-col rounded-card bg-surface-card p-3 shadow-[var(--shadow-card)]',
        isSheet ? 'gap-2.5' : 'gap-2'
      )}
    >
      <InspirationDestinationChip question={prompt.question} groupColor={prompt.groupColor} />
      {title && <div className='font-semibold text-fg-primary text-sm'>{title}</div>}
      <TipTapEditor
        editor={editor}
        className={cn(
          'max-h-48 overflow-auto rounded-md border border-hairline-field p-2 text-fg-primary focus-within:border-accent',
          isSheet ? 'text-[15px] leading-[22px]' : 'text-[13px] leading-5'
        )}
      />
      <div className='flex items-center justify-between'>
        <span className='text-[11px] text-fg-muted'>{source}</span>
        {isAdded ? (
          <div className='flex h-8 items-center gap-1 px-2 font-semibold text-[13px] text-jade-600'>
            <CheckIcon className='h-4 w-4' />
            Added
          </div>
        ) : (
          <Button
            variant='secondary'
            size={isSheet ? 'md' : 'sm'}
            className={isSheet ? 'h-10' : undefined}
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
