import {Editor} from '@tiptap/core'
import type {Plugin} from '@tiptap/pm/state'
import {EditorState} from '@tiptap/pm/state'
import {Decoration, DecorationSet} from '@tiptap/pm/view'
import StarterKit from '@tiptap/starter-kit'
import {
  INSERTED_HIGHLIGHT_CLASS,
  INSERTED_SETTLED_CLASS,
  InsertedRangeHighlight,
  insertedRangeKey
} from '../InsertedRangeHighlight'

interface NodeDecorationInternals {
  type: {attrs: Record<string, string>}
}

const getDecorationAttrs = (decoration: Decoration) =>
  (decoration as unknown as NodeDecorationInternals).type.attrs

const createFixture = () => {
  const editor = new Editor({
    extensions: [StarterKit, InsertedRangeHighlight],
    content: {type: 'doc', content: [{type: 'paragraph'}]}
  })
  const {schema} = editor
  const plugin = editor.extensionManager.plugins.find(
    (candidate) => candidate.spec.key === insertedRangeKey
  ) as Plugin
  const doc = schema.node('doc', null, [
    schema.node('paragraph', null, schema.text('one')),
    schema.node('paragraph', null, schema.text('two')),
    schema.node('paragraph', null, schema.text('three'))
  ])
  const state = EditorState.create({doc, schema, plugins: [plugin]})
  return {state, plugin}
}

const getDecorations = (plugin: Plugin, state: EditorState) => {
  const decorationSource = plugin.props.decorations?.call(plugin, state)
  return decorationSource instanceof DecorationSet ? decorationSource.find() : []
}

const markRange = (state: EditorState) =>
  state.apply(state.tr.setMeta(insertedRangeKey, {mark: {id: 'r1', from: 5, to: 17}}))

describe('InsertedRangeHighlight', () => {
  it('decorates each top-level block in the marked range', () => {
    const {state, plugin} = createFixture()
    const marked = markRange(state)

    const decorations = getDecorations(plugin, marked)
    expect(decorations).toHaveLength(2)
    const [first, second] = decorations
    expect(first!.from).toBe(5)
    expect(first!.to).toBe(10)
    expect(second!.from).toBe(10)
    expect(second!.to).toBe(17)
    expect(getDecorationAttrs(first!)).toEqual({
      class: INSERTED_HIGHLIGHT_CLASS,
      'data-sr-added': 'r1'
    })
  })

  it('shifts the tracked range when text is inserted before it', () => {
    const {state} = createFixture()
    const marked = markRange(state)

    const edited = marked.apply(marked.tr.insertText('X', 1))

    expect(insertedRangeKey.getState(edited)?.get('r1')).toEqual({from: 6, to: 18, settled: false})
  })

  it('shrinks the tracked range when text inside it is deleted', () => {
    const {state} = createFixture()
    const marked = markRange(state)

    const edited = marked.apply(marked.tr.delete(6, 7))

    expect(insertedRangeKey.getState(edited)?.get('r1')).toEqual({from: 5, to: 16, settled: false})
  })

  it('keeps the range tracked after settle and swaps in the settled class', () => {
    const {state, plugin} = createFixture()
    const marked = markRange(state)

    const settled = marked.apply(marked.tr.setMeta(insertedRangeKey, {settle: 'r1'}))

    expect(insertedRangeKey.getState(settled)?.get('r1')).toEqual({from: 5, to: 17, settled: true})
    const decorations = getDecorations(plugin, settled)
    expect(decorations).toHaveLength(2)
    expect(getDecorationAttrs(decorations[0]!)).toEqual({
      class: INSERTED_SETTLED_CLASS,
      'data-sr-added': 'settled'
    })
  })

  it('forgets a range once its whole content is deleted', () => {
    const {state, plugin} = createFixture()
    const marked = markRange(state)

    const edited = marked.apply(marked.tr.delete(5, 17))

    expect(insertedRangeKey.getState(edited)?.has('r1')).toBe(false)
    expect(getDecorations(plugin, edited)).toHaveLength(0)
  })

  it('forgets a range on explicit forgetInsertedRange', () => {
    const {state, plugin} = createFixture()
    const marked = markRange(state)

    const forgotten = marked.apply(marked.tr.setMeta(insertedRangeKey, {forget: 'r1'}))

    expect(insertedRangeKey.getState(forgotten)?.has('r1')).toBe(false)
    expect(getDecorations(plugin, forgotten)).toHaveLength(0)
  })
})
