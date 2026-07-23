import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import type {Editor} from '@tiptap/core'
import {useEffect, useState} from 'react'
import {Button} from '../../ui/Button/Button'

interface Props {
  editor: Editor
}

export const StarterActions = (props: Props) => {
  const {editor} = props
  const [isEmpty, setIsEmpty] = useState(false)

  useEffect(() => {
    if (!editor) return
    const handleUpdate = () => {
      const {doc} = editor.state
      setIsEmpty(doc.childCount === 2 && doc.child(1).content.size === 0)
    }
    handleUpdate()
    editor.on('update', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor])
  if (!isEmpty) return null

  return (
    <div className='w-full px-6'>
      <Button
        variant='outline'
        className='text-fg-secondary text-sm'
        onClick={() => {
          editor.chain().focus().setInsights().run()
        }}
      >
        <AutoAwesomeIcon className='size-4' />
        <span className='pl-1'>Add Insights</span>
      </Button>
    </div>
  )
}
