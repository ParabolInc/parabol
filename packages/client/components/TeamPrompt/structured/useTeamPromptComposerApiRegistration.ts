import type {Editor, JSONContent} from '@tiptap/core'
import {type MutableRefObject, useContext, useEffect, useRef} from 'react'
import {
  getInsertedRange,
  getInsertedRanges
} from '../../../tiptap/extensions/insertedRangeHighlight/InsertedRangeHighlight'
import {
  type StreamHandle,
  streamContentIntoEditor
} from '../../TipTapEditor/streamContentIntoEditor'
import TeamPromptComposerApiContext, {type InsertHandle} from './TeamPromptComposerApiContext'

const HIGHLIGHT_MS = 1800
const STREAM_WORD_DELAY_MS = 3
const EDITOR_MOUNT_POLL_MS = 16
const EDITOR_MOUNT_TIMEOUT_MS = 4000

type EditorRefs = MutableRefObject<Map<string, MutableRefObject<Editor | null>>>
type Timers = Map<ReturnType<typeof setTimeout>, () => void>

interface Options {
  editorRefs: EditorRefs
  onChange: (promptId: string, editor: Editor) => void
  expand: () => void
  onInserted?: () => void
}

const delay = (timers: Timers, ms: number) =>
  new Promise<boolean>((resolve) => {
    const timer = setTimeout(() => {
      timers.delete(timer)
      resolve(true)
    }, ms)
    timers.set(timer, () => resolve(false))
  })

const waitForEditor = async (editorRefs: EditorRefs, promptId: string, timers: Timers) => {
  const deadline = Date.now() + EDITOR_MOUNT_TIMEOUT_MS
  while (true) {
    const editor = editorRefs.current.get(promptId)?.current
    if (editor && !editor.isDestroyed) return editor
    if (Date.now() >= deadline) return null
    const waited = await delay(timers, EDITOR_MOUNT_POLL_MS)
    if (!waited) return null
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
  const {editorRefs, onChange, expand, onInserted} = options
  const apiRef = useContext(TeamPromptComposerApiContext)
  const insertCountRef = useRef(0)
  const insertQueuesRef = useRef(new Map<string, Promise<unknown>>())
  const streamingPromptIdsRef = useRef(new Set<string>())
  const streamHandlesRef = useRef(new Map<string, StreamHandle>())
  const settledWhileStreamingRef = useRef(new Set<string>())
  const timersRef = useRef<Timers>(new Map())

  useEffect(
    () => () => {
      streamHandlesRef.current.forEach((handle) => handle.cancel())
      streamHandlesRef.current.clear()
      timersRef.current.forEach((cancel, timer) => {
        clearTimeout(timer)
        cancel()
      })
      timersRef.current.clear()
    },
    []
  )

  useEffect(() => {
    if (!apiRef) return
    const timers = timersRef.current
    const streamingPromptIds = streamingPromptIdsRef.current
    const streamHandles = streamHandlesRef.current
    const settledWhileStreaming = settledWhileStreamingRef.current
    const insert = async (promptId: string, blocks: JSONContent[]) => {
      const mounted = editorRefs.current.get(promptId)?.current
      if (mounted && !mounted.isDestroyed && !mounted.isEditable) return null
      expand()
      const editor = await waitForEditor(editorRefs, promptId, timers)
      if (!editor || !editor.isEditable) return null
      const base = editor.getJSON()
      const wasEmpty = editor.isEmpty
      const baseBlocks = wasEmpty ? [] : (base.content ?? [])
      const baseDoc: JSONContent = {...base, content: baseBlocks}
      const fullDoc: JSONContent = {...base, content: [...baseBlocks, ...blocks]}
      const from = wasEmpty ? 0 : editor.state.doc.content.size
      const trackedRanges = getInsertedRanges(editor)
      trackedRanges.forEach((_range, trackedId) => {
        editor.commands.forgetInsertedRange(trackedId)
      })
      insertCountRef.current += 1
      const id = `${promptId}:${insertCountRef.current}`
      streamingPromptIds.add(promptId)
      try {
        await new Promise<void>((resolve) => {
          streamHandles.set(
            promptId,
            streamContentIntoEditor(editor, baseDoc, fullDoc, {
              wordDelayMs: STREAM_WORD_DELAY_MS,
              onDone: resolve
            })
          )
        })
      } finally {
        streamingPromptIds.delete(promptId)
        streamHandles.delete(promptId)
      }
      if (editor.isDestroyed) return null
      if (!wasEmpty && trackedRanges.size > 0) {
        editor.commands.restoreInsertedRanges(
          Array.from(trackedRanges, ([trackedId, range]) => ({
            id: trackedId,
            from: range.from,
            to: range.to,
            settled: range.settled || settledWhileStreaming.has(trackedId)
          }))
        )
      }
      trackedRanges.forEach((_range, trackedId) => settledWhileStreaming.delete(trackedId))
      editor.commands.markInsertedRange(
        id,
        from,
        endOfInsertedBlocks(editor, from, baseBlocks.length, blocks.length)
      )
      const timer = setTimeout(() => {
        timers.delete(timer)
        if (editor.isDestroyed) return
        if (streamingPromptIds.has(promptId)) {
          settledWhileStreaming.add(id)
          return
        }
        editor.commands.settleInsertedRange(id)
      }, HIGHLIGHT_MS)
      timers.set(timer, () => {})
      onChange(promptId, editor)
      onInserted?.()
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
        return queued.catch(() => null)
      },
      undoInsert: ({id, promptId}) => {
        if (streamingPromptIds.has(promptId)) return false
        const editor = editorRefs.current.get(promptId)?.current
        if (!editor || editor.isDestroyed) return false
        const range = getInsertedRange(editor, id)
        if (!range) return false
        editor.chain().deleteRange(range).forgetInsertedRange(id).run()
        return true
      },
      forgetInsert: ({id, promptId}) => {
        if (streamingPromptIds.has(promptId)) return
        const editor = editorRefs.current.get(promptId)?.current
        if (!editor || editor.isDestroyed) return
        editor.commands.forgetInsertedRange(id)
      },
      getAnswerText: (promptId) => editorRefs.current.get(promptId)?.current?.getText() ?? ''
    }
    return () => {
      apiRef.current = null
    }
  }, [apiRef, editorRefs, onChange, expand, onInserted])
}

export default useTeamPromptComposerApiRegistration
