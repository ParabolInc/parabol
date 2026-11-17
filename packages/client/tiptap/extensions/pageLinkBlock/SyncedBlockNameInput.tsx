import type {Editor} from '@tiptap/core'
import {NodeSelection} from '@tiptap/pm/state'
import {type KeyboardEvent, useEffect, useRef} from 'react'
import {renameSyncedBlock} from './renameSyncedBlock'
import type {SyncedBlockChrome} from './SyncedBlockEditor'

interface Props {
  chrome: SyncedBlockChrome
  name: string
  hostEditor: Editor
  getPos: () => number | undefined
  onClose: () => void
}

export const SyncedBlockNameInput = (props: Props) => {
  const {chrome, name, hostEditor, getPos, onClose} = props
  const inputRef = useRef<HTMLInputElement>(null)
  const isDoneRef = useRef(false)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const finish = (shouldCommit: boolean, shouldReturnFocus: boolean) => {
    if (isDoneRef.current) return
    isDoneRef.current = true
    if (shouldCommit) renameSyncedBlock(chrome.editor, inputRef.current?.value ?? name)
    onClose()
    if (!shouldReturnFocus) return
    const pos = getPos()
    if (pos !== undefined) {
      const {view} = hostEditor
      view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos)))
      view.focus()
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return
    if (event.key === 'Enter') {
      event.preventDefault()
      finish(true, true)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      finish(false, true)
    }
  }

  return (
    <input
      ref={inputRef}
      defaultValue={name}
      placeholder='Name this block'
      aria-label='Block name'
      onKeyDown={handleKeyDown}
      onBlur={() => finish(true, false)}
      className='min-w-[72px] flex-auto border-0 bg-transparent p-0 font-semibold text-inherit text-xs outline-none placeholder:text-current placeholder:opacity-60'
    />
  )
}
