import AttachFileIcon from '@mui/icons-material/AttachFile'
import ImageIcon from '@mui/icons-material/Image'
import * as Popover from '@radix-ui/react-popover'
import {type NodeViewProps, NodeViewWrapper} from '@tiptap/react'
import {useEffect, useRef, useState} from 'react'
import useEventCallback from '../../../hooks/useEventCallback'
import type {FileUploadAttrs} from '../../../shared/tiptap/extensions/FileUploadBase'
import {FileSelector} from './FileSelector'

const useHideWhenTriggerHidden = (setOpen: (open: boolean) => void) => {
  const triggerRef = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && !entry?.isIntersecting && triggerRef.current) {
          setOpen(false)
        }
      },
      {
        root: null,
        threshold: 0.9 // Ensure the div is completely hidden
      }
    )

    if (triggerRef.current) {
      observer.observe(triggerRef.current)
    }

    return () => {
      if (triggerRef.current) {
        observer.unobserve(triggerRef.current)
      }
    }
  }, [])
  return triggerRef
}

export const FileUploadView = (props: NodeViewProps) => {
  const {editor, node, selected} = props
  const {targetType} = node.attrs as FileUploadAttrs
  const [open, setOpen] = useState(false)
  const onOpenChange = (willOpen: boolean) => {
    const {isEditable} = editor
    if (!willOpen) {
      if (isEditable) {
        // when hitting escape, go back to the active node
        editor.commands.focus()
      }
      setOpen(false)
    } else if (isEditable) {
      setOpen(true)
    }
  }
  const openPopover = useEventCallback(() => {
    console.log('open')
    if (selected) {
      setOpen(true)
    }
  })

  useEffect(() => {
    editor.on('enter', openPopover)
    return () => {
      editor.off('enter', openPopover)
    }
  }, [editor])
  const triggerRef = useHideWhenTriggerHidden(setOpen)
  const labelSuffix = targetType === 'image' ? 'an image' : 'a file'
  const label = `Upload or embed ${labelSuffix}`
  const Icon = targetType === 'image' ? ImageIcon : AttachFileIcon
  return (
    <NodeViewWrapper>
      <Popover.Root open={open} onOpenChange={onOpenChange}>
        <Popover.Trigger asChild>
          <div className='m-0 p-0' contentEditable={false} ref={triggerRef}>
            <div className='flex cursor-pointer items-center rounded-sm bg-slate-200 p-2 transition-colors hover:bg-slate-300 group-[.ProseMirror-selectednode]:bg-slate-300'>
              <Icon className='mr-2 size-5' />
              <span className='text-sm'>{label}</span>
            </div>
          </div>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content asChild align='start' alignOffset={8} collisionPadding={8}>
            {/* z-30 is for expanded reflection stacks using Zindex.DIALOG */}
            <div className='top-0 left-0 z-30 flex max-h-(--radix-popper-available-height) max-w-(--radix-popover-content-available-width) flex-col overflow-hidden data-[side=bottom]:animate-slide-down data-[side=top]:animate-slide-up'>
              <FileSelector editor={editor} targetType={targetType} />
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </NodeViewWrapper>
  )
}
