import {type NodeViewProps, NodeViewWrapper} from '@tiptap/react'
import {useEffect} from 'react'
export const ThinkingBlockView = (props: NodeViewProps) => {
  const {editor} = props
  useEffect(() => {
    editor.setEditable(false)
    return () => {
      editor.setEditable(true)
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
