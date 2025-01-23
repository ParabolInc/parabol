import ImageIcon from '@mui/icons-material/Image'
import * as Popover from '@radix-ui/react-popover'
import {NodeViewWrapper, type NodeViewProps} from '@tiptap/react'
import {useEffect, useRef, useState} from 'react'
import useEventCallback from '../../../hooks/useEventCallback'
import {ImageSelector} from './ImageSelector'

const useHideWhenTriggerHidden = (setOpen: (open: boolean) => void) => {
  const triggerRef = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
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

export const ImageUploadView = (props: NodeViewProps) => {
  const {editor} = props
  const [open, setOpen] = useState(false)
  const onOpenChange = (willOpen: boolean) => {
    const {isEditable} = editor
    if (!willOpen) {
      if (isEditable) {
        editor.commands.focus()
      }
      setOpen(false)
    } else if (isEditable) {
      setOpen(true)
    }
  }
  const openPopover = useEventCallback(() => {
    setOpen(true)
  })

  useEffect(() => {
    editor.storage.imageUpload.emitter.on('enter', openPopover)
    return () => {
      editor.storage.imageUpload.emitter.off('enter', openPopover)
    }
  }, [])
  const triggerRef = useHideWhenTriggerHidden(setOpen)

  return (
    <NodeViewWrapper>
      <Popover.Root open={open} onOpenChange={onOpenChange}>
        <Popover.Trigger asChild>
          <div className='m-0 p-0' contentEditable={false} ref={triggerRef}>
            <div className='flex cursor-pointer items-center rounded bg-slate-200 p-2 hover:bg-slate-300'>
              <ImageIcon className='size-6' />
              <span className='text-sm'>Add an image</span>
            </div>
          </div>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            asChild
            align='start'
            alignOffset={8}
            collisionPadding={8}
            onOpenAutoFocus={(e) => {
              e.preventDefault()
            }}
          >
            {/* z-30 is for expanded reflection stacks using Zindex.DIALOG */}
            <div className='absolute left-0 top-0 z-30 flex max-h-[var(--radix-popper-available-height)] flex-col overflow-hidden'>
              <ImageSelector editor={editor} />
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </NodeViewWrapper>
  )
}
