import {type NodeViewProps, NodeViewWrapper} from '@tiptap/react'
import {useEffect} from 'react'
import {getHasPermanentlyUnmounted} from '../getHasPermanentlyUnmounted'
export const ThinkingBlockView = (props: NodeViewProps) => {
  const {editor, node} = props
  useEffect(() => {
    if (editor.isEditable) {
      editor.setEditable(false)
    }
    return () => {
      const hasPermanentlyUnmounted = getHasPermanentlyUnmounted(editor, node)
      if (hasPermanentlyUnmounted) {
        editor.setEditable(true)
      }
    }
  }, [editor])
  return (
    <NodeViewWrapper>
      <span
        className='dura inline-block size-3 animate-pulse rounded-full bg-slate-600'
        style={{animationDuration: '750ms'}}
      />
    </NodeViewWrapper>
  )
}
