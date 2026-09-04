import type {Editor, JSONContent} from '@tiptap/core'
import {type MutableRefObject, useContext, useEffect, useRef} from 'react'
import {
  getInsertedRange,
  getInsertedRanges
} from '../../../tiptap/extensions/insertedRangeHighlight/InsertedRangeHighlight'
import {streamContentIntoEditor} from '../../TipTapEditor/streamContentIntoEditor'
import TeamPromptComposerApiContext, {type InsertHandle} from './TeamPromptComposerApiContext'

const HIGHLIGHT_MS = 1800
const STREAM_WORD_DELAY_MS = 3
const EDITOR_MOUNT_POLL_MS = 16
const EDITOR_MOUNT_TIMEOUT_MS = 4000

type EditorRefs = MutableRefObject<Map<string, MutableRefObject<Editor | null>>>
type Timers = Set<ReturnType<typeof setTimeout>>

interface Options {
  editorRefs: EditorRefs
  onChange: (promptId: string, editor: Editor) => void
  expand: () => void
}

const delay = (timers: Timers, ms: number) =>
  new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      timers.delete(timer)
      resolve()
    }, ms)
    timers.add(timer)
  })

const waitForEditor = async (editorRefs: EditorRefs, promptId: string, timers: Timers) => {
  const deadline = Date.now() + EDITOR_MOUNT_TIMEOUT_MS
  while (true) {
    const editor = editorRefs.current.get(promptId)?.current
    if (editor && !editor.isDestroyed) return editor
    if (Date.now() >= deadline) return null
    await delay(timers, EDITOR_MOUNT_POLL_MS)
  }
}

const endOfInsertedBlocks = (editor: Editor, from: number, firstIndex: number, count: number) => {
  const {doc} = editor.state
  const lastIndex = Math.min(firstIndex + count, doc.childCount)
  let to = from
  for (let index = firstIndex; index < lastIndex; index++) to += doc.child(index).nodeSize
  return to
}

const useTeamPromptComposerApiRegistration = (options: Options) => {
  const {editorRefs, onChange, expand} = options
  const apiRef = useContext(TeamPromptComposerApiContext)
  const insertCountRef = useRef(0)
  const insertQueuesRef = useRef(new Map<string, Promise<unknown>>())
  const timersRef = useRef<Timers>(new Set())

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => clearTimeout(timer))
      timersRef.current.clear()
    },
    []
  )

  useEffect(() => {
    if (!apiRef) return
    const timers = timersRef.current
    const insert = async (promptId: string, blocks: JSONContent[]) => {
      expand()
      const editor = await waitForEditor(editorRefs, promptId, timers)
      if (!editor || !editor.isEditable) return null
      const base = editor.getJSON()
      const baseBlocks = editor.isEmpty ? [] : (base.content ?? [])
      const baseDoc: JSONContent = {...base, content: baseBlocks}
      const fullDoc: JSONContent = {...base, content: [...baseBlocks, ...blocks]}
      const from = editor.isEmpty ? 0 : editor.state.doc.content.size
      const trackedRanges = getInsertedRanges(editor)
      insertCountRef.current += 1
      const id = `${promptId}:${insertCountRef.current}`
      await new Promise<void>((resolve) => {
        streamContentIntoEditor(editor, baseDoc, fullDoc, {
          wordDelayMs: STREAM_WORD_DELAY_MS,
          onDone: resolve
        })
      })
      if (editor.isDestroyed) return null
      trackedRanges.forEach((range, trackedId) => {
        editor.commands.markInsertedRange(trackedId, range.from, range.to)
        if (range.settled) editor.commands.settleInsertedRange(trackedId)
      })
      editor.commands.markInsertedRange(
        id,
        from,
        endOfInsertedBlocks(editor, from, baseBlocks.length, blocks.length)
      )
      const timer = setTimeout(() => {
        timers.delete(timer)
        if (!editor.isDestroyed) editor.commands.settleInsertedRange(id)
      }, HIGHLIGHT_MS)
      timers.add(timer)
      onChange(promptId, editor)
      return {id, promptId} satisfies InsertHandle
    }
    apiRef.current = {
      insertAnswerBlocks: (promptId, blocks) => {
        const queued = (insertQueuesRef.current.get(promptId) ?? Promise.resolve()).then(() =>
          insert(promptId, blocks)
        )
        insertQueuesRef.current.set(
          promptId,
          queued.catch(() => undefined)
        )
        return queued
      },
      undoInsert: ({id, promptId}) => {
        const editor = editorRefs.current.get(promptId)?.current
        if (!editor || editor.isDestroyed) return false
        const range = getInsertedRange(editor, id)
        if (!range) return false
        editor.chain().deleteRange(range).forgetInsertedRange(id).run()
        onChange(promptId, editor)
        return true
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
