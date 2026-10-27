import {useEffect} from 'react'
import {TipTapEditor} from '../../../components/TipTapEditor/TipTapEditor'
import useEventCallback from '../../../hooks/useEventCallback'
import {useTipTapCommentEditor} from '../../../hooks/useTipTapCommentEditor'
import {plaintextToTipTap} from '../../../shared/tiptap/plaintextToTipTap'
import {Button} from '../../../ui/Button/Button'

const EMPTY_CONTENT = JSON.stringify(plaintextToTipTap(''))

interface Props {
  placeholder: string
  submitLabel: string
  submitting: boolean
  autoFocus?: boolean
  // call `onSubmitted` once the comment was saved, so the composer keeps the text if saving fails
  onSubmit: (content: string, onSubmitted: () => void) => void
  onCancel: () => void
}

export const PageCommentComposer = (props: Props) => {
  const {placeholder, submitLabel, submitting, autoFocus, onSubmit, onCancel} = props
  const submit = useEventCallback(() => {
    if (!editor || editor.isEmpty || submitting) return
    onSubmit(JSON.stringify(editor.getJSON()), () => editor.commands.clearContent())
  })
  const cancel = useEventCallback(() => {
    editor?.commands.clearContent()
    onCancel()
  })
  const {editor} = useTipTapCommentEditor(EMPTY_CONTENT, {
    placeholder,
    onEnter: submit,
    onEscape: cancel
  })
  useEffect(() => {
    if (autoFocus) editor?.commands.focus()
  }, [editor, autoFocus])
  if (!editor) return null
  return (
    <div className='flex flex-col gap-2'>
      <div className='rounded-md border border-hairline-field bg-surface-input px-2 py-1.5 focus-within:border-accent'>
        <TipTapEditor editor={editor} className='max-h-40 overflow-y-auto text-base sm:text-sm' />
      </div>
      <div className='flex justify-end gap-2'>
        <Button variant='flat' size='sm' onClick={cancel}>
          Cancel
        </Button>
        <Button variant='dialogPrimary' size='sm' onClick={submit} disabled={submitting}>
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}
