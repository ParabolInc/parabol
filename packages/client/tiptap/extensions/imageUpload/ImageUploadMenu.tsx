import * as Popover from '@radix-ui/react-popover'
import type {Editor} from '@tiptap/core'
import {useEffect, useRef, useState} from 'react'
import {ImageSelector} from './ImageSelector'

interface Props {
  editor: Editor
}

export const ImageUploadMenu = ({editor}: Props) => {
  const ref = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState('')
  const isActive = editor.isActive('imageUpload')
  useEffect(() => {
    setOpen(isActive)
  }, [isActive])

  const [open, setOpen] = useState(isActive)
  const onOpenChange = (willOpen: boolean) => {
    if (!willOpen) {
      setOpen(false)
      return
    }
  }
  useEffect(() => {
    if (!ref.current) return
    if (!isActive) return
    const coords = editor.view.coordsAtPos(editor.state.selection.from)
    const {left, top, right} = coords
    const childWidth = ref.current?.getBoundingClientRect().width ?? 0
    const widthDiff = childWidth ? (childWidth - (right - left)) / 2 : 0
    setTransform(`translate(${left - widthDiff}px,${top + 40}px)`)
  }, [isActive, ref.current])

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild />
      <Popover.Portal>
        <Popover.Content
          asChild
          onOpenAutoFocus={(e) => {
            // necessary for link preview to prevent focusing the first button
            e.preventDefault()
          }}
        >
          <div className='absolute left-0 top-0 z-10' style={{transform}} ref={ref}>
            <ImageSelector editor={editor} />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
