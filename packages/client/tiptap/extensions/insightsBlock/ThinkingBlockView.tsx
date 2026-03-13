import {type NodeViewProps, NodeViewWrapper} from '@tiptap/react'
import {useEffect} from 'react'
import {getHasPermanentlyUnmounted} from '../getHasPermanentlyUnmounted'
export const ThinkingBlockView = (props: NodeViewProps) => {
  const {editor, node} = props
  useEffect(() => {
    // Defer setEditable to a macrotask so it runs after React's full commit phase.
    // TipTap calls flushSync internally in setEditable, which can't be nested inside
    // React's lifecycle. setTimeout (macrotask) guarantees we're outside React's work.
    const timer = setTimeout(() => {
      if (editor.isEditable) {
        editor.setEditable(false)
      }
    }, 0)
    return () => {
      clearTimeout(timer)
      const hasPermanentlyUnmounted = getHasPermanentlyUnmounted(editor, node)
      if (hasPermanentlyUnmounted) {
        setTimeout(() => {
          editor.setEditable(true)
        }, 0)
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
