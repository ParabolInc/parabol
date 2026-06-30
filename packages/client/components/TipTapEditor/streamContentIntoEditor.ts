import type {Editor, JSONContent} from '@tiptap/core'
import {isEqualWhenSerialized} from '../../shared/isEqualWhenSerialized'

interface StreamOptions {
  /** ms between each revealed word (default 25) */
  wordDelayMs?: number
  /** called once the full content has been revealed (or the stream was cancelled) */
  onDone?: () => void
}

export interface StreamHandle {
  /** stop streaming and immediately render the full target content */
  cancel: () => void
}

const WORD_RE = /\S+\s*/g

const countWords = (node: JSONContent): number => {
  if (node.type === 'text') return (node.text?.match(WORD_RE) ?? []).length
  if (!node.content) return 0
  return node.content.reduce((sum, child) => sum + countWords(child), 0)
}

// Returns a copy of `node` keeping only the first `budget.remaining` words of its text,
// preserving marks and structure. Returns null once nothing in the node is revealed yet.
const truncateNode = (node: JSONContent, budget: {remaining: number}): JSONContent | null => {
  if (budget.remaining <= 0) return null
  if (node.type === 'text') {
    const words = node.text?.match(WORD_RE) ?? []
    if (words.length <= budget.remaining) {
      budget.remaining -= words.length
      return node
    }
    const kept = words.slice(0, budget.remaining).join('')
    budget.remaining = 0
    return {...node, text: kept}
  }
  // leaf nodes with no text children (hardBreak, image, …) reveal atomically
  if (!node.content) return node
  const content: JSONContent[] = []
  for (const child of node.content) {
    if (budget.remaining <= 0) break
    const truncated = truncateNode(child, budget)
    if (truncated) content.push(truncated)
  }
  if (content.length === 0) return null
  return {...node, content}
}

// Builds a doc made of every base node plus the appended nodes truncated to `revealedWords` words.
const buildPartialDoc = (
  baseDoc: JSONContent,
  fullDoc: JSONContent,
  revealedWords: number
): JSONContent => {
  const baseNodes = baseDoc.content ?? []
  const appendedNodes = (fullDoc.content ?? []).slice(baseNodes.length)
  const budget = {remaining: revealedWords}
  const revealed: JSONContent[] = []
  for (const node of appendedNodes) {
    if (budget.remaining <= 0) break
    const truncated = truncateNode(node, budget)
    if (truncated) revealed.push(truncated)
  }
  return {...fullDoc, content: [...baseNodes, ...revealed]}
}

/**
 * True when `fullDoc` is `baseDoc` with extra top-level nodes appended to the end, i.e. the existing
 * content is untouched and only new blocks were added. Streaming only makes sense in this case.
 */
export const isAppendOf = (baseDoc: JSONContent, fullDoc: JSONContent): boolean => {
  const baseNodes = baseDoc.content ?? []
  const fullNodes = fullDoc.content ?? []
  if (fullNodes.length < baseNodes.length) return false
  return baseNodes.every((node, idx) => isEqualWhenSerialized(node, fullNodes[idx]))
}

/**
 * Reveals the nodes appended to `baseDoc` (to reach `fullDoc`) one word at a time, ChatGPT-style,
 * by repeatedly setting the editor content to a growing slice. Existing (`baseDoc`) nodes stay put,
 * so the editor only grows as words stream in. All writes use `emitUpdate: false` so they don't fire
 * the editor's `onUpdate` (no localStorage churn, no "editing" state).
 *
 * Caller is responsible for deciding this is an append (see `isAppendOf`); otherwise just setContent.
 */
export const streamContentIntoEditor = (
  editor: Editor,
  baseDoc: JSONContent,
  fullDoc: JSONContent,
  {wordDelayMs = 15, onDone}: StreamOptions = {}
): StreamHandle => {
  const totalWords = (fullDoc.content ?? [])
    .slice((baseDoc.content ?? []).length)
    .reduce((sum, node) => sum + countWords(node), 0)

  let revealed = 0
  let timer: ReturnType<typeof setTimeout> | null = null
  let finished = false

  const finish = () => {
    if (finished) return
    finished = true
    if (timer) clearTimeout(timer)
    // guard against a cancel that arrives after the editor was torn down (unmount)
    if (!editor.isDestroyed) editor.commands.setContent(fullDoc, {emitUpdate: false})
    onDone?.()
  }

  const tick = () => {
    if (finished || editor.isDestroyed) return
    revealed += 1
    if (revealed >= totalWords) {
      finish()
      return
    }
    editor.commands.setContent(buildPartialDoc(baseDoc, fullDoc, revealed), {emitUpdate: false})
    timer = setTimeout(tick, wordDelayMs)
  }

  if (totalWords === 0) {
    finish()
  } else {
    editor.commands.setContent(baseDoc, {emitUpdate: false})
    timer = setTimeout(tick, wordDelayMs)
  }

  return {cancel: finish}
}
