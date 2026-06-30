import type {Editor, JSONContent} from '@tiptap/core'
import {useEffect, useRef} from 'react'
import {isEqualWhenSerialized} from '../../shared/isEqualWhenSerialized'
import {isAppendOf, type StreamHandle, streamContentIntoEditor} from './streamContentIntoEditor'

const EMPTY_DOC: JSONContent = {type: 'doc', content: []}

interface Options {
  /** ms between each revealed word */
  wordDelayMs?: number
}

/**
 * Keeps a tiptap editor in sync with `content`, but when new top-level nodes are *appended* (e.g.
 * "Add to response"), reveals them one word at a time, ChatGPT-style, instead of swapping the doc.
 * Anything else (in-place edits, replacements, the editor's own submitted content) is applied
 * instantly.
 *
 * Resilient to Relay's optimistic-update churn: one logical change can surface as
 * `optimistic → rollback → server` (e.g. B → A → B). We remember the stream's target and ignore any
 * update that's merely "behind" it, so a transient rollback can't cancel an in-flight reveal.
 */
export const useStreamedEditorContent = (
  editor: Editor | null,
  content: JSONContent | null,
  options?: Options
) => {
  const wordDelayMs = options?.wordDelayMs
  // the content currently fully reflected in the editor — the base any append builds on
  const committedRef = useRef<JSONContent>(content ?? EMPTY_DOC)
  const streamRef = useRef<{handle: StreamHandle; target: JSONContent} | null>(null)

  useEffect(() => {
    if (!editor) return
    const next = content ?? EMPTY_DOC
    const active = streamRef.current

    if (active) {
      // already streaming toward exactly this → let it run
      if (isEqualWhenSerialized(active.target, next)) return
      // `next` is a prefix of the in-flight target (a rollback / stale optimistic frame) → ignore
      if (isAppendOf(next, active.target)) return
      // the target genuinely changed: stop now — `cancel` snaps the editor to (and commits) the
      // old target, which becomes the base for whatever comes next
      active.handle.cancel()
      streamRef.current = null
    }

    if (isEqualWhenSerialized(committedRef.current, next)) return
    // the editor already shows `next` (it originated here, e.g. the viewer typed & submitted) — adopt
    // it without re-typing it back at them
    if (isEqualWhenSerialized(editor.getJSON(), next)) {
      committedRef.current = next
      return
    }

    const base = committedRef.current
    if (isAppendOf(base, next)) {
      const handle = streamContentIntoEditor(editor, base, next, {
        wordDelayMs,
        onDone: () => {
          committedRef.current = next
          if (streamRef.current?.handle === handle) streamRef.current = null
        }
      })
      streamRef.current = {handle, target: next}
    } else {
      editor.commands.setContent(next, {emitUpdate: false})
      committedRef.current = next
    }
  }, [content, editor, wordDelayMs])

  // stop any in-flight stream only when the component unmounts
  useEffect(() => () => streamRef.current?.handle.cancel(), [])
}
