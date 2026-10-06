import {Editor} from '@tiptap/core'
import {Fragment, type Node as ProseMirrorNode, type Schema} from '@tiptap/pm/model'
import {liftListItem, splitListItem, wrapInList} from '@tiptap/pm/schema-list'
import type {Plugin} from '@tiptap/pm/state'
import {EditorState, TextSelection, type Transaction} from '@tiptap/pm/state'
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

const createFixture = (buildBlocks?: (schema: Schema) => ProseMirrorNode[]) => {
  const editor = new Editor({
    extensions: [StarterKit, InsertedRangeHighlight],
    content: {type: 'doc', content: [{type: 'paragraph'}]}
  })
  const {schema} = editor
  const plugin = editor.extensionManager.plugins.find(
    (candidate) => candidate.spec.key === insertedRangeKey
  ) as Plugin
  const blocks = buildBlocks
    ? buildBlocks(schema)
    : [
        schema.node('paragraph', null, schema.text('one')),
        schema.node('paragraph', null, schema.text('two')),
        schema.node('paragraph', null, schema.text('three'))
      ]
  const doc = schema.node('doc', null, blocks)
  const state = EditorState.create({doc, schema, plugins: [plugin]})
  return {state, plugin, schema}
}

const listItem = (schema: Schema, text: string) =>
  schema.node('listItem', null, schema.node('paragraph', null, schema.text(text)))

const createListFixture = () =>
  createFixture((schema) => [
    schema.node('paragraph', null, schema.text('base')),
    schema.node('bulletList', null, [listItem(schema, 'alpha'), listItem(schema, 'beta')])
  ])

const markAt = (state: EditorState, from: number, to: number) =>
  state.apply(state.tr.setMeta(insertedRangeKey, {mark: {id: 'r1', from, to}}))

const tracked = (state: EditorState) => insertedRangeKey.getState(state)?.get('r1')

const pressEnter = (state: EditorState, at: number) => {
  const selected = state.apply(state.tr.setSelection(TextSelection.create(state.doc, at)))
  let next = selected
  const dispatch = (tr: Transaction) => {
    next = selected.apply(tr)
  }
  const itemType = selected.schema.nodes.listItem!
  if (!splitListItem(itemType)(selected, dispatch)) liftListItem(itemType)(selected, dispatch)
  return next
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

  it('restores a range that a whole-doc replace dropped', () => {
    const {state, plugin} = createFixture()
    const marked = markRange(state)
    const snapshot = new Map(insertedRangeKey.getState(marked) ?? [])

    const appended = state.schema.node('paragraph', null, state.schema.text('four'))
    const replaced = marked.apply(
      marked.tr.replaceWith(
        0,
        marked.doc.content.size,
        marked.doc.content.append(Fragment.from(appended))
      )
    )

    expect(insertedRangeKey.getState(replaced)?.has('r1')).toBe(false)

    const previous = snapshot.get('r1')!
    const restored = replaced.apply(
      replaced.tr.setMeta(insertedRangeKey, {
        mark: {id: 'r1', from: previous.from, to: previous.to}
      })
    )

    expect(insertedRangeKey.getState(restored)?.get('r1')).toEqual({
      from: 5,
      to: 17,
      settled: false
    })
    const decorations = getDecorations(plugin, restored)
    expect(decorations).toHaveLength(2)
    expect(decorations[0]!.from).toBe(5)
    expect(decorations[1]!.to).toBe(17)
  })

  it('re-marks a forgotten range at its snapshotted coordinates', () => {
    const {state, plugin} = createFixture()
    const marked = markRange(state)
    const snapshot = insertedRangeKey.getState(marked)?.get('r1')!

    const forgotten = marked.apply(marked.tr.setMeta(insertedRangeKey, {forget: 'r1'}))
    const appended = state.schema.node('paragraph', null, state.schema.text('four'))
    const replaced = forgotten.apply(
      forgotten.tr.replaceWith(
        0,
        forgotten.doc.content.size,
        forgotten.doc.content.append(Fragment.from(appended))
      )
    )

    expect(insertedRangeKey.getState(replaced)?.size).toBe(0)
    expect(getDecorations(plugin, replaced)).toHaveLength(0)

    const remarked = replaced.apply(
      replaced.tr.setMeta(insertedRangeKey, {
        mark: {id: 'r1', from: snapshot.from, to: snapshot.to}
      })
    )
    const settled = remarked.apply(remarked.tr.setMeta(insertedRangeKey, {settle: 'r1'}))

    expect(insertedRangeKey.getState(settled)?.get('r1')).toEqual({from: 5, to: 17, settled: true})
    const decorations = getDecorations(plugin, settled)
    expect(decorations).toHaveLength(2)
    expect(decorations[0]!.from).toBe(5)
    expect(decorations[1]!.to).toBe(17)
  })

  it('forgets a range on explicit forgetInsertedRange', () => {
    const {state, plugin} = createFixture()
    const marked = markRange(state)

    const forgotten = marked.apply(marked.tr.setMeta(insertedRangeKey, {forget: 'r1'}))

    expect(insertedRangeKey.getState(forgotten)?.has('r1')).toBe(false)
    expect(getDecorations(plugin, forgotten)).toHaveLength(0)
  })

  it('leaves a block inserted at the trailing boundary outside the range', () => {
    const {state} = createFixture()
    const marked = markRange(state)
    const own = state.schema.node('paragraph', null, state.schema.text('mine'))

    const edited = marked.apply(marked.tr.insert(17, own))

    expect(insertedRangeKey.getState(edited)?.get('r1')).toEqual({from: 5, to: 17, settled: false})
  })

  it('leaves a paragraph split off the end of the range, and its text, outside the range', () => {
    const {state} = createFixture()
    const marked = markRange(state)

    const split = marked.apply(marked.tr.split(16))
    const typed = split.apply(split.tr.insertText('mine', 18))

    expect(insertedRangeKey.getState(typed)?.get('r1')).toEqual({from: 5, to: 17, settled: false})
    expect(typed.doc.child(3).textContent).toBe('mine')
  })

  it('leaves a block inserted at the leading boundary outside the range', () => {
    const {state} = createFixture()
    const marked = markRange(state)
    const own = state.schema.node('paragraph', null, state.schema.text('mine'))

    const edited = marked.apply(marked.tr.insert(5, own))

    expect(insertedRangeKey.getState(edited)?.get('r1')).toEqual({from: 11, to: 23, settled: false})
  })

  it('grows the range when text is typed inside its last block', () => {
    const {state} = createFixture()
    const marked = markRange(state)

    const edited = marked.apply(marked.tr.insertText('X', 16))

    expect(insertedRangeKey.getState(edited)?.get('r1')).toEqual({from: 5, to: 18, settled: false})
  })

  it('clamps a mark that reaches past the end of the document', () => {
    const {state, plugin} = createFixture()

    const marked = state.apply(
      state.tr.setMeta(insertedRangeKey, {
        mark: {id: 'r1', from: 5, to: state.doc.content.size + 10}
      })
    )

    expect(insertedRangeKey.getState(marked)?.get('r1')).toEqual({from: 5, to: 17, settled: false})
    expect(() => getDecorations(plugin, marked)).not.toThrow()
    expect(getDecorations(plugin, marked)).toHaveLength(2)
  })

  it('drops a mark that lies entirely past the end of the document', () => {
    const {state, plugin} = createFixture()
    const size = state.doc.content.size

    const marked = state.apply(
      state.tr.setMeta(insertedRangeKey, {mark: {id: 'r1', from: size + 5, to: size + 10}})
    )

    expect(insertedRangeKey.getState(marked)?.has('r1')).toBe(false)
    expect(() => getDecorations(plugin, marked)).not.toThrow()
  })

  it('restores every snapshotted range in one transaction', () => {
    const {state, plugin} = createFixture()

    const restored = state.apply(
      state.tr.setMeta(insertedRangeKey, {
        restore: [
          {id: 'r1', from: 0, to: 5, settled: true},
          {id: 'r2', from: 5, to: 17, settled: false}
        ]
      })
    )

    expect(insertedRangeKey.getState(restored)?.get('r1')).toEqual({from: 0, to: 5, settled: true})
    expect(insertedRangeKey.getState(restored)?.get('r2')).toEqual({
      from: 5,
      to: 17,
      settled: false
    })
    const decorations = getDecorations(plugin, restored)
    expect(decorations).toHaveLength(3)
    expect(getDecorationAttrs(decorations[0]!)).toEqual({
      class: INSERTED_SETTLED_CLASS,
      'data-sr-added': 'settled'
    })
    expect(getDecorationAttrs(decorations[1]!)).toEqual({
      class: INSERTED_HIGHLIGHT_CLASS,
      'data-sr-added': 'r2'
    })
  })

  it('drops a restored range that no longer fits the document', () => {
    const {state} = createFixture()
    const size = state.doc.content.size

    const restored = state.apply(
      state.tr.setMeta(insertedRangeKey, {
        restore: [{id: 'r1', from: size + 5, to: size + 10, settled: false}]
      })
    )

    expect(insertedRangeKey.getState(restored)?.size).toBe(0)
  })

  it('leaves a paragraph split off the start of the range, and its text, outside the range', () => {
    const {state} = createFixture()
    const marked = markRange(state)

    const split = marked.apply(marked.tr.split(6))
    const typed = split.apply(split.tr.insertText('MINE', 6))

    expect(tracked(typed)).toEqual({from: 11, to: 23, settled: false})
    expect(typed.doc.child(1).textContent).toBe('MINE')
  })

  it('leaves a list item split off the end of a trailing list outside the range', () => {
    const {state} = createListFixture()
    const marked = markAt(state, 6, 25)

    const split = pressEnter(marked, 22)
    const typed = split.apply(split.tr.insertText('MINE', 26))

    expect(tracked(typed)).toEqual({from: 6, to: 24, settled: false})
    expect(typed.doc.child(1).lastChild!.textContent).toBe('MINE')
  })

  it('leaves a paragraph lifted out of a trailing list outside the range', () => {
    const {state} = createListFixture()
    const marked = markAt(state, 6, 25)

    const split = pressEnter(marked, 22)
    const lifted = pressEnter(split, split.doc.content.size - 3)
    const typed = lifted.apply(lifted.tr.insertText('MINE', lifted.doc.content.size - 1))

    expect(typed.doc.lastChild!.type.name).toBe('paragraph')
    expect(typed.doc.lastChild!.textContent).toBe('MINE')
    expect(tracked(typed)).toEqual({from: 6, to: 25, settled: false})
  })

  it('keeps tracking the last inserted paragraph when it is wrapped in a list', () => {
    const {state, plugin, schema} = createFixture()
    const marked = markRange(state)

    const selected = marked.apply(marked.tr.setSelection(TextSelection.create(marked.doc, 16)))
    let wrapped = selected
    wrapInList(schema.nodes.bulletList!)(selected, (tr) => {
      wrapped = selected.apply(tr)
    })

    expect(wrapped.doc.lastChild!.type.name).toBe('bulletList')
    expect(tracked(wrapped)).toEqual({from: 5, to: wrapped.doc.content.size, settled: false})
    expect(getDecorations(plugin, wrapped)).toHaveLength(2)
  })

  it('leaves a paragraph split off the end of a trailing blockquote outside the range', () => {
    const {state} = createFixture((schema) => [
      schema.node('paragraph', null, schema.text('base')),
      schema.node('blockquote', null, schema.node('paragraph', null, schema.text('quoted')))
    ])
    const marked = markAt(state, 6, 16)

    const split = marked.apply(marked.tr.split(14))
    const typed = split.apply(split.tr.insertText('MINE', 16))

    expect(tracked(typed)).toEqual({from: 6, to: 15, settled: false})
    expect(typed.doc.child(1).lastChild!.textContent).toBe('MINE')
  })

  it('tracks a leaf node range without drifting off its boundaries', () => {
    const {state, schema} = createFixture((schema) => [
      schema.node('paragraph', null, schema.text('base')),
      schema.node('horizontalRule')
    ])
    const marked = markAt(state, 6, 7)

    const shifted = marked.apply(marked.tr.insertText('X', 1))
    expect(tracked(shifted)).toEqual({from: 7, to: 8, settled: false})

    const appended = marked.apply(
      marked.tr.insert(7, schema.node('paragraph', null, schema.text('mine')))
    )
    expect(tracked(appended)).toEqual({from: 6, to: 7, settled: false})

    const prepended = marked.apply(
      marked.tr.insert(6, schema.node('paragraph', null, schema.text('mine')))
    )
    expect(tracked(prepended)).toEqual({from: 12, to: 13, settled: false})
  })

  it('leaves the block a Backspace at the leading seam merges into outside the range', () => {
    const {state} = createFixture((schema) => [
      schema.node('paragraph', null, schema.text('mine')),
      schema.node('paragraph', null, schema.text('two')),
      schema.node('paragraph', null, schema.text('three'))
    ])
    const marked = markAt(state, 6, 18)

    const merged = marked.apply(marked.tr.delete(5, 7))
    const range = tracked(merged)!

    expect(range).toEqual({from: 5, to: 16, settled: false})
    expect(merged.doc.textBetween(0, range.from)).toBe('mine')
    expect(merged.apply(merged.tr.delete(range.from, range.to)).doc.textContent).toBe('mine')
  })

  it('keeps the viewer out of the range when the first inserted block is wrapped in a list', () => {
    const {state, schema} = createFixture()
    const marked = markRange(state)

    const selected = marked.apply(marked.tr.setSelection(TextSelection.create(marked.doc, 6)))
    let wrapped = selected
    wrapInList(schema.nodes.bulletList!)(selected, (tr) => {
      wrapped = selected.apply(tr)
    })
    const range = tracked(wrapped)!

    expect(wrapped.doc.child(1).type.name).toBe('bulletList')
    expect(range.from).toBeGreaterThanOrEqual(5)
    expect(range.to).toBe(wrapped.doc.content.size)
    expect(wrapped.apply(wrapped.tr.delete(range.from, range.to)).doc.child(0).textContent).toBe(
      'one'
    )
  })

  it('leaves a list item split off the start of a leading list outside the range', () => {
    const {state} = createListFixture()
    const marked = markAt(state, 6, 25)

    const split = pressEnter(marked, 9)
    const range = tracked(split)!

    expect(split.doc.child(1).firstChild!.textContent).toBe('')
    expect(range.from).toBe(11)
    expect(split.doc.resolve(range.from).nodeAfter!.textContent).toBe('alpha')
  })

  it('tracks a single-block range through splits at both ends', () => {
    const {state} = createFixture((schema) => [
      schema.node('paragraph', null, schema.text('one')),
      schema.node('paragraph', null, schema.text('two'))
    ])
    const marked = markAt(state, 5, 10)

    const splitStart = marked.apply(marked.tr.split(6))
    expect(tracked(splitStart)).toEqual({from: 7, to: 12, settled: false})

    const splitEnd = splitStart.apply(splitStart.tr.split(11))
    expect(tracked(splitEnd)).toEqual({from: 7, to: 12, settled: false})

    const typed = splitEnd.apply(splitEnd.tr.insertText('X', 9))
    expect(tracked(typed)).toEqual({from: 7, to: 13, settled: false})
  })

  it('tracks an empty inserted paragraph', () => {
    const {state, schema} = createFixture((schema) => [
      schema.node('paragraph', null, schema.text('one')),
      schema.node('paragraph')
    ])
    const marked = markAt(state, 5, 7)

    const typed = marked.apply(marked.tr.insertText('drafted', 6))
    expect(tracked(typed)).toEqual({from: 5, to: 14, settled: false})

    const appended = marked.apply(
      marked.tr.insert(7, schema.node('paragraph', null, schema.text('mine')))
    )
    expect(tracked(appended)).toEqual({from: 5, to: 7, settled: false})
  })

  it('leaves a sibling split off a nested list item outside the range', () => {
    const {state} = createFixture((schema) => [
      schema.node('paragraph', null, schema.text('base')),
      schema.node('bulletList', null, [
        schema.node('listItem', null, [
          schema.node('paragraph', null, schema.text('alpha')),
          schema.node('bulletList', null, [listItem(schema, 'deep')])
        ])
      ])
    ])
    const marked = markAt(state, 6, state.doc.content.size)
    const deepEnd = state.doc.content.size - 5

    const split = pressEnter(marked, deepEnd)
    const typed = split.apply(split.tr.insertText('MINE', deepEnd + 4))
    const range = tracked(typed)!

    expect(typed.doc.textContent).toContain('MINE')
    expect(range.to).toBeLessThan(typed.doc.content.size)
    expect(typed.apply(typed.tr.delete(range.from, range.to)).doc.textContent).toBe('baseMINE')
  })

  it('leaves every block-aligned range byte-identical across a meta-only transaction', () => {
    const shapes: [string, EditorState, number, number][] = [
      ['paragraphs', createFixture().state, 5, 17],
      ['list', createListFixture().state, 6, 25],
      [
        'leaf',
        createFixture((schema) => [
          schema.node('paragraph', null, schema.text('base')),
          schema.node('horizontalRule')
        ]).state,
        6,
        7
      ]
    ]
    shapes.forEach(([name, state, from, to]) => {
      const marked = markAt(state, from, to)
      const settled = marked.apply(marked.tr.setMeta(insertedRangeKey, {settle: 'r1'}))
      const idle = settled.apply(settled.tr.setMeta('addToHistory', false))

      expect([name, tracked(settled)]).toEqual([name, {from, to, settled: true}])
      expect([name, tracked(idle)]).toEqual([name, {from, to, settled: true}])
    })
  })
})
