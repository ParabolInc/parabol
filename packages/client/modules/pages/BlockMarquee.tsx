import type {Editor} from '@tiptap/core'
import type {RefObject} from 'react'
import {createPortal} from 'react-dom'
import {useBlockMarquee} from './useBlockMarquee'

interface Props {
  editor: Editor
  containerRef: RefObject<HTMLElement | null>
}

export const BlockMarquee = ({editor, containerRef}: Props) => {
  const box = useBlockMarquee(editor, containerRef)
  if (!box) return null
  return createPortal(
    <div
      aria-hidden
      className='pointer-events-none fixed z-20 border border-accent-strong bg-accent/8'
      style={box}
    />,
    document.body
  )
}
