import {Content, Portal, Root, Trigger} from '@radix-ui/react-tooltip'
import {EditorContent, type NodeViewProps, NodeViewWrapper} from '@tiptap/react'
import {useTipTapTaskEditor} from '../../../hooks/useTipTapTaskEditor'
import type {PopoverMentionAttrs} from '../../../shared/tiptap/extensions/PopoverMentionBase'

export const PopoverMentionView = (props: NodeViewProps) => {
  const {label, content} = props.node.attrs as PopoverMentionAttrs
  // the popover renders the stored TipTap document as a read-only block
  const {editor} = useTipTapTaskEditor(content, {readOnly: true})
  return (
    <NodeViewWrapper as='span' className='inline'>
      <Root>
        <Trigger asChild>
          <span className='cursor-help font-semibold text-sky-500 underline decoration-dotted underline-offset-2'>
            {label}
          </span>
        </Trigger>
        {content && editor ? (
          <Portal>
            <Content
              side='top'
              sideOffset={4}
              className='z-20 max-h-80 max-w-sm animate-scale-in overflow-auto rounded-sm bg-white p-3 text-left text-slate-700 text-sm shadow-lg [&_h1]:mb-1 [&_h1]:font-semibold [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm'
            >
              <EditorContent editor={editor} />
            </Content>
          </Portal>
        ) : null}
      </Root>
    </NodeViewWrapper>
  )
}
