import type {Editor} from '@tiptap/core'
import {useEditorState} from '@tiptap/react'
import {useEffect, useRef, useState} from 'react'
import {getSelectedBlockRange} from '../../tiptap/blockSelection/blockSelectionState'
import {countBlocks} from '../../tiptap/blockSelection/blockUnits'
import {getBlockSelectionAnnouncement} from '../../tiptap/blockSelection/getBlockSelectionAnnouncement'

const ANNOUNCE_DEBOUNCE_MS = 300

interface Props {
  editor: Editor
}

export const BlockSelectionAnnouncer = ({editor}: Props) => {
  const count = useEditorState({
    editor,
    selector: ({editor}) => {
      if (editor.isDestroyed) return 0
      const range = getSelectedBlockRange(editor.state)
      return range ? countBlocks(editor.state.doc, range) : 0
    }
  })
  const prevCountRef = useRef(count)
  const [announcement, setAnnouncement] = useState('')
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const next = getBlockSelectionAnnouncement(prevCountRef.current, count)
      prevCountRef.current = count
      if (next) setAnnouncement(next)
    }, ANNOUNCE_DEBOUNCE_MS)
    return () => clearTimeout(timeoutId)
  }, [count])
  return (
    <div className='sr-only' aria-live='polite'>
      {announcement}
    </div>
  )
}
