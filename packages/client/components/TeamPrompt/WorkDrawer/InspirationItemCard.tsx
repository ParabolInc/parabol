import CheckIcon from '@mui/icons-material/Check'
import type {Editor, JSONContent} from '@tiptap/core'
import {useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {Button} from '../../../ui/Button/Button'
import {TipTapEditor} from '../../TipTapEditor/TipTapEditor'
import {TiptapLinkExtension} from '../../TipTapEditor/TiptapLinkExtension'

interface Props {
  title: string | null
  content: JSONContent
  onAddToResponse: (editor: Editor) => void
  responsePlaintext: string
  disabled?: boolean
}

const InspirationItemCard = (props: Props) => {
  const {title, content, onAddToResponse, responsePlaintext, disabled} = props
  const editor = useEditor({
    content,
    extensions: [
      StarterKit.configure({link: false}),
      TiptapLinkExtension.configure({openOnClick: false})
    ]
  })

  if (!editor) return null
  const itemText = editor.getText().trim()
  const isAdded = !!itemText && responsePlaintext.includes(itemText)
  return (
    <div className='flex flex-col gap-2 rounded-card bg-white p-3 shadow-card'>
      {title && <div className='font-semibold text-slate-700 text-sm'>{title}</div>}
      <TipTapEditor
        editor={editor}
        className='max-h-48 overflow-auto rounded-md border border-slate-300 p-2 text-slate-700 focus-within:border-sky-500'
      />
      <div className='flex justify-end'>
        {isAdded ? (
          <div className='flex items-center gap-1 px-3 py-1 font-semibold text-forest-500 text-sm'>
            <CheckIcon className='h-4 w-4' />
            Added
          </div>
        ) : (
          <Button
            variant='secondary'
            size='sm'
            shape='pill'
            disabled={disabled || editor.isEmpty}
            onClick={() => onAddToResponse(editor)}
          >
            Add to response
          </Button>
        )}
      </div>
    </div>
  )
}

export default InspirationItemCard
