import type {Editor, JSONContent} from '@tiptap/core'
import {type MutableRefObject, useContext, useEffect} from 'react'
import {getInsertedRange} from '../../../tiptap/extensions/insertedRangeHighlight/InsertedRangeHighlight'
import {streamContentIntoEditor} from '../../TipTapEditor/streamContentIntoEditor'
import TeamPromptComposerApiContext from './TeamPromptComposerApiContext'

const HIGHLIGHT_MS = 1800
const STREAM_WORD_DELAY_MS = 3
const EDITOR_MOUNT_POLL_MS = 16
const EDITOR_MOUNT_TIMEOUT_MS = 4000

interface Options {
  editorRefs: MutableRefObject<Map<string, MutableRefObject<Editor | null>>>
  onChange: (promptId: string, editor: Editor) => void
  expand: () => void
}

let insertCount = 0

const waitForEditor = (editorRefs: Options['editorRefs'], promptId: string) =>
  new Promise<Editor | null>((resolve) => {
    const deadline = Date.now() + EDITOR_MOUNT_TIMEOUT_MS
    const check = () => {
      const editor = editorRefs.current.get(promptId)?.current
      if (editor && !editor.isDestroyed) return resolve(editor)
      if (Date.now() >= deadline) return resolve(null)
      setTimeout(check, EDITOR_MOUNT_POLL_MS)
    }
    check()
  })

// The editor appends a trailing paragraph after a block that cannot end a doc, so the range ends at
// the last block we actually inserted, not at the end of the doc
const insertedRangeEnd = (editor: Editor, from: number, firstIndex: number, count: number) => {
  const {doc} = editor.state
  const lastIndex = Math.min(firstIndex + count, doc.childCount)
  let to = from
  for (let index = firstIndex; index < lastIndex; index++) to += doc.child(index).nodeSize
  return to
}

const useTeamPromptComposerApiRegistration = (options: Options) => {
  const {editorRefs, onChange, expand} = options
  const apiRef = useContext(TeamPromptComposerApiContext)

  useEffect(() => {
    if (!apiRef) return
    apiRef.current = {
      insertAnswerBlocks: async (promptId, blocks) => {
        expand()
        const editor = await waitForEditor(editorRefs, promptId)
        if (!editor) return null
        const base = editor.getJSON()
        const baseBlocks = editor.isEmpty ? [] : (base.content ?? [])
        const baseDoc: JSONContent = {...base, content: baseBlocks}
        const fullDoc: JSONContent = {...base, content: [...baseBlocks, ...blocks]}
        const from = editor.isEmpty ? 0 : editor.state.doc.content.size
        insertCount += 1
        const id = `${promptId}:${insertCount}`
        await new Promise<void>((resolve) => {
          streamContentIntoEditor(editor, baseDoc, fullDoc, {
            wordDelayMs: STREAM_WORD_DELAY_MS,
            onDone: resolve
          })
        })
        if (editor.isDestroyed) return null
        const to = insertedRangeEnd(editor, from, baseBlocks.length, blocks.length)
        editor.commands.markInsertedRange(id, from, to)
        setTimeout(() => {
          if (!editor.isDestroyed) editor.commands.settleInsertedRange(id)
        }, HIGHLIGHT_MS)
        onChange(promptId, editor)
        return {id, promptId}
      },
      undoInsert: ({id, promptId}) => {
        const editor = editorRefs.current.get(promptId)?.current
        if (!editor || editor.isDestroyed) return
        const range = getInsertedRange(editor, id)
        if (!range) return
        editor.chain().deleteRange(range).forgetInsertedRange(id).run()
        onChange(promptId, editor)
      },
      forgetInsert: ({id, promptId}) => {
        const editor = editorRefs.current.get(promptId)?.current
        if (!editor || editor.isDestroyed) return
        editor.commands.forgetInsertedRange(id)
      },
      getAnswerText: (promptId) => editorRefs.current.get(promptId)?.current?.getText() ?? ''
    }
    return () => {
      apiRef.current = null
    }
  }, [apiRef, editorRefs, onChange, expand])
}

export default useTeamPromptComposerApiRegistration
