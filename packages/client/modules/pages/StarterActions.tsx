import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import type {Editor} from '@tiptap/core'
import {useEffect, useRef, useState} from 'react'
import {Button} from '../../ui/Button/Button'

interface Props {
  editor: Editor
}

export const StarterActions = (props: Props) => {
  const {editor} = props
  const [isEmpty, setIsEmpty] = useState(false)
  const transformRef = useRef<undefined | string>(undefined)
  const getTransform = () => {
    const coords = editor.view.coordsAtPos(1)
    const {left, top} = coords
    if (left !== 0 && top !== 0) {
      transformRef.current = `translate(${coords.left}px,${coords.top + 90}px)`
    }
    return transformRef.current
  }

  useEffect(() => {
    if (!editor) return
    const handleUpdate = () => {
      const {doc} = editor.state
      const nextIsEmpty = doc.childCount === 2 && doc.child(1).content.size === 0
      if (nextIsEmpty) {
        getTransform()
      }
      setIsEmpty(nextIsEmpty)
    }
    handleUpdate()
    editor.on('update', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor])
  if (!isEmpty) return null

  return (
    <div className='fixed top-0 left-0' style={{transform: transformRef.current}}>
      <Button
        variant='outline'
        className='rounded-full text-slate-600 text-sm'
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
