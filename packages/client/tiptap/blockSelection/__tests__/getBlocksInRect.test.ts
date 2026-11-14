import '../../extensions/__tests__/installHappyDom'
import {li, link, makeEditor, p, toggle} from '../../blockMove/__tests__/blockMoveTestHelpers'
import {createBlockSelection} from '../blockSelectionState'
import {getBlockUnitAt} from '../blockUnits'
import {
  getBlocksInRect,
  getRunFromBoxes,
  getUnitBoxes,
  isRunBackward,
  type UnitBox
} from '../getBlocksInRect'
import {callout, nodeNamesIn, posInText, textsIn} from './blockSelectionTestHelpers'

const box = (from: number, top: number, bottom: number): UnitBox => ({
  from,
  to: from + 10,
  top,
  bottom,
  left: 100,
  right: 700
})

const units = [box(10, 0, 20), box(20, 30, 50), box(30, 60, 80)]

describe('getBlocksInRect', () => {
  test('returns the first and last units the rect overlaps', () => {
    const hit = getBlocksInRect(units, {top: 40, bottom: 70, left: 0, right: 150})
    expect(hit?.first).toBe(units[1])
    expect(hit?.last).toBe(units[2])
  })
  test('touching is enough, containment is not required', () => {
    const hit = getBlocksInRect(units, {top: 49, bottom: 51, left: 650, right: 800})
    expect(hit?.first).toBe(units[1])
    expect(hit?.last).toBe(units[1])
  })
  test('a rect in the gap between blocks hits nothing', () => {
    expect(getBlocksInRect(units, {top: 21, bottom: 29, left: 0, right: 800})).toBeNull()
  })
  test('a rect that shares only an edge does not touch', () => {
    expect(getBlocksInRect(units, {top: 20, bottom: 30, left: 0, right: 800})).toBeNull()
  })
  test('a rect entirely left of the blocks hits nothing', () => {
    expect(getBlocksInRect(units, {top: 0, bottom: 100, left: 0, right: 100})).toBeNull()
  })
  test('first and last follow document order, not rect order', () => {
    const shuffled = [units[2]!, units[0]!, units[1]!]
    const hit = getBlocksInRect(shuffled, {top: 0, bottom: 100, left: 0, right: 800})
    expect(hit?.first).toBe(units[0])
    expect(hit?.last).toBe(units[2])
  })
  test('a parent whose child unit is hit drops out, leaving the child', () => {
    const parent: UnitBox = {from: 5, to: 50, top: 0, bottom: 60, left: 100, right: 700}
    const child: UnitBox = {from: 20, to: 40, top: 30, bottom: 50, left: 120, right: 700}
    const hit = getBlocksInRect([parent, child], {top: 35, bottom: 45, left: 0, right: 800})
    expect(hit?.first).toBe(child)
    expect(hit?.last).toBe(child)
  })
  test('a parent hit in its own area and in a child keeps both', () => {
    const parent: UnitBox = {from: 5, to: 50, top: 0, bottom: 60, left: 100, right: 700}
    const child: UnitBox = {from: 20, to: 40, top: 30, bottom: 50, left: 120, right: 700}
    const hit = getBlocksInRect([parent, child], {top: 20, bottom: 40, left: 0, right: 800})
    expect(hit?.first).toBe(parent)
    expect(hit?.last).toBe(child)
  })
  test('the gap between two hit children is not the parent own area', () => {
    const parent: UnitBox = {from: 5, to: 50, top: 0, bottom: 60, left: 100, right: 700}
    const one: UnitBox = {from: 6, to: 20, top: 0, bottom: 28, left: 120, right: 700}
    const two: UnitBox = {from: 20, to: 49, top: 32, bottom: 60, left: 120, right: 700}
    const hit = getBlocksInRect([parent, one, two], {top: 20, bottom: 40, left: 0, right: 800})
    expect(hit?.first).toBe(one)
    expect(hit?.last).toBe(two)
  })
  test('a parent hit only outside its child units is kept', () => {
    const parent: UnitBox = {from: 5, to: 50, top: 0, bottom: 60, left: 100, right: 700}
    const child: UnitBox = {from: 20, to: 40, top: 30, bottom: 50, left: 120, right: 700}
    const hit = getBlocksInRect([parent, child], {top: 5, bottom: 15, left: 0, right: 800})
    expect(hit?.first).toBe(parent)
    expect(hit?.last).toBe(parent)
  })
})

describe('getUnitBoxes', () => {
  test('lists every unit, nested list items included, but not the title or paragraphs inside items', () => {
    const editor = makeEditor(p('intro'), {
      type: 'bulletList',
      content: [
        {type: 'listItem', content: [p('outer'), {type: 'bulletList', content: [li('inner')]}]}
      ]
    })
    jest.spyOn(editor.view, 'nodeDOM').mockImplementation(() => {
      const element = document.createElement('div')
      element.getBoundingClientRect = () =>
        ({top: 0, bottom: 10, left: 0, right: 10}) as unknown as DOMRect
      return element
    })
    const names = getUnitBoxes(editor.view).map(
      ({from}) => editor.state.doc.nodeAt(from)?.type.name
    )
    expect(names).toEqual(['paragraph', 'bulletList', 'listItem', 'listItem'])
  })
  test('a list inside a quote is one unit, like the handle and the keys treat it', () => {
    const editor = makeEditor(p('intro'), {
      type: 'blockquote',
      content: [{type: 'bulletList', content: [li('quoted')]}]
    })
    jest.spyOn(editor.view, 'nodeDOM').mockImplementation(() => {
      const element = document.createElement('div')
      element.getBoundingClientRect = () =>
        ({top: 0, bottom: 10, left: 0, right: 10}) as unknown as DOMRect
      return element
    })
    const names = getUnitBoxes(editor.view).map(
      ({from}) => editor.state.doc.nodeAt(from)?.type.name
    )
    expect(names).toEqual(['paragraph', 'blockquote'])
  })
  test('skips units with no element', () => {
    const editor = makeEditor(p('intro'))
    jest.spyOn(editor.view, 'nodeDOM').mockImplementation(() => null)
    expect(getUnitBoxes(editor.view)).toEqual([])
  })
})

describe('getRunFromBoxes', () => {
  const unitOf = (editor: ReturnType<typeof makeEditor>, text: string) =>
    getBlockUnitAt(editor.state.doc, posInText(editor, text))!

  test('items within one list stay items', () => {
    const editor = makeEditor(p('Owners'), {
      type: 'bulletList',
      content: [li('a'), li('b'), li('c'), li('d')]
    })
    const run = getRunFromBoxes(editor.state.doc, unitOf(editor, 'b'), unitOf(editor, 'c'))!
    expect(textsIn(editor, run)).toEqual(['b', 'c'])
  })
  test('an item plus the following paragraph takes the whole list', () => {
    const editor = makeEditor(
      p('Owners'),
      {type: 'bulletList', content: [li('a'), li('b')]},
      p('after')
    )
    const run = getRunFromBoxes(editor.state.doc, unitOf(editor, 'b'), unitOf(editor, 'after'))!
    expect(nodeNamesIn(editor, run)).toEqual(['bulletList', 'paragraph'])
  })
  test('children inside a toggle stay inside; past it takes the toggle', () => {
    const editor = makeEditor(toggle('Notes', p('one'), p('two')), p('after'))
    const inside = getRunFromBoxes(editor.state.doc, unitOf(editor, 'one'), unitOf(editor, 'two'))!
    expect(textsIn(editor, inside)).toEqual(['one', 'two'])
    const past = getRunFromBoxes(editor.state.doc, unitOf(editor, 'two'), unitOf(editor, 'after'))!
    expect(nodeNamesIn(editor, past)).toEqual(['details', 'paragraph'])
  })
  test('callout body blocks stay inside the callout', () => {
    const editor = makeEditor(callout('Heads up', p('x'), p('y')), p('after'))
    const run = getRunFromBoxes(editor.state.doc, unitOf(editor, 'x'), unitOf(editor, 'y'))!
    expect(textsIn(editor, run)).toEqual(['x', 'y'])
  })
  test('an atom page link can be part of the run', () => {
    const editor = makeEditor(p('before'), link(7, 'Child', false), p('after'))
    const doc = editor.state.doc
    let linkUnit: {from: number; to: number} | null = null
    doc.descendants((node, pos) => {
      if (node.type.name === 'pageLinkBlock') linkUnit = {from: pos, to: pos + node.nodeSize}
    })
    const run = getRunFromBoxes(doc, unitOf(editor, 'before'), linkUnit!)!
    expect(nodeNamesIn(editor, run)).toEqual(['paragraph', 'pageLinkBlock'])
  })
  test('an anchor unit widens the run', () => {
    const editor = makeEditor(p('one'), p('two'), p('three'))
    const run = getRunFromBoxes(
      editor.state.doc,
      unitOf(editor, 'one'),
      unitOf(editor, 'one'),
      unitOf(editor, 'three')
    )!
    expect(textsIn(editor, run)).toEqual(['one', 'two', 'three'])
  })
  test('never includes the title', () => {
    const editor = makeEditor(p('one'), p('two'))
    const run = getRunFromBoxes(editor.state.doc, unitOf(editor, 'one'), unitOf(editor, 'two'))!
    expect(textsIn(editor, run)).toEqual(['one', 'two'])
    expect(run.from).toBe(editor.state.doc.firstChild!.nodeSize)
  })
})

describe('a marquee over a real layout', () => {
  const ROW = 20
  const layOut = (editor: ReturnType<typeof makeEditor>) => {
    const {doc} = editor.state
    const rows: number[] = []
    doc.descendants((node, pos) => {
      if (!node.isTextblock && !(node.isBlock && node.isLeaf)) return true
      rows.push(pos)
      return false
    })
    jest.spyOn(editor.view, 'nodeDOM').mockImplementation((pos) => {
      const node = doc.nodeAt(pos)!
      const inside = rows.flatMap((rowPos, row) =>
        rowPos >= pos && rowPos < pos + node.nodeSize ? [row] : []
      )
      const top = inside[0]! * ROW
      const bottom = inside[inside.length - 1]! * ROW + ROW - 2
      const left = 100 + doc.resolve(pos).depth * 10
      const element = document.createElement('div')
      element.getBoundingClientRect = () => ({top, bottom, left, right: 700}) as unknown as DOMRect
      return element
    })
    const rowOf = (text: string) =>
      rows.findIndex((rowPos) => doc.nodeAt(rowPos)?.textContent === text)
    return {boxes: getUnitBoxes(editor.view), rowOf}
  }
  const runInRect = (
    editor: ReturnType<typeof makeEditor>,
    firstText: string,
    lastText: string
  ) => {
    const {boxes, rowOf} = layOut(editor)
    const rect = {
      top: rowOf(firstText) * ROW + 4,
      bottom: rowOf(lastText) * ROW + 8,
      left: 0,
      right: 800
    }
    const hit = getBlocksInRect(boxes, rect)!
    return getRunFromBoxes(editor.state.doc, hit.first, hit.last)!
  }

  test('a box across items 2 and 3 of a list selects just those items', () => {
    const editor = makeEditor(p('Owners'), {
      type: 'bulletList',
      content: [li('a'), li('b'), li('c'), li('d'), li('e'), li('f')]
    })
    expect(textsIn(editor, runInRect(editor, 'b', 'c'))).toEqual(['b', 'c'])
  })
  test('a box from a paragraph through a list to a paragraph selects the three blocks', () => {
    const editor = makeEditor(
      p('before'),
      {type: 'bulletList', content: [li('a'), li('b')]},
      p('after')
    )
    expect(nodeNamesIn(editor, runInRect(editor, 'before', 'after'))).toEqual([
      'paragraph',
      'bulletList',
      'paragraph'
    ])
  })
  test('a box inside a nested list selects the inner item alone', () => {
    const editor = makeEditor({
      type: 'bulletList',
      content: [
        {type: 'listItem', content: [p('outer'), {type: 'bulletList', content: [li('inner')]}]},
        li('next')
      ]
    })
    expect(textsIn(editor, runInRect(editor, 'inner', 'inner'))).toEqual(['inner'])
  })
  test('a box across toggle children selects those children', () => {
    const editor = makeEditor(toggle('Notes', p('one'), p('two'), p('three')), p('after'))
    expect(textsIn(editor, runInRect(editor, 'one', 'two'))).toEqual(['one', 'two'])
  })
  test('a box over the toggle summary alone selects the toggle', () => {
    const editor = makeEditor(toggle('Notes', p('one')), p('after'))
    expect(nodeNamesIn(editor, runInRect(editor, 'Notes', 'Notes'))).toEqual(['details'])
  })
  test('a box from a paragraph into a toggle takes the whole toggle', () => {
    const editor = makeEditor(p('before'), toggle('Notes', p('one'), p('two')))
    expect(nodeNamesIn(editor, runInRect(editor, 'before', 'one'))).toEqual([
      'paragraph',
      'details'
    ])
  })
  test('a box across callout body blocks selects those blocks', () => {
    const editor = makeEditor(callout('Heads up', p('x'), p('y'), p('z')), p('after'))
    expect(textsIn(editor, runInRect(editor, 'x', 'y'))).toEqual(['x', 'y'])
  })
  test('a box from the callout title into its body selects the whole callout', () => {
    const editor = makeEditor(callout('Heads up', p('x'), p('y')), p('after'))
    expect(nodeNamesIn(editor, runInRect(editor, 'Heads up', 'x'))).toEqual(['callout'])
  })
  test('a box over an outer item line and its nested child selects the outer item', () => {
    const editor = makeEditor({
      type: 'bulletList',
      content: [
        {type: 'listItem', content: [p('outer'), {type: 'bulletList', content: [li('inner')]}]},
        li('next')
      ]
    })
    const run = runInRect(editor, 'outer', 'inner')
    expect(nodeNamesIn(editor, run)).toEqual(['listItem'])
    expect(textsIn(editor, run)).toEqual(['outerinner'])
  })
  test('a box from a toggle summary into its first child selects the whole toggle', () => {
    const editor = makeEditor(toggle('Notes', p('one'), p('two')), p('after'))
    expect(nodeNamesIn(editor, runInRect(editor, 'Notes', 'one'))).toEqual(['details'])
  })
  test('a box over the callout title alone selects the callout', () => {
    const editor = makeEditor(callout('Heads up', p('x')), p('after'))
    expect(nodeNamesIn(editor, runInRect(editor, 'Heads up', 'Heads up'))).toEqual(['callout'])
  })
})

describe('isRunBackward', () => {
  const setup = () => {
    const editor = makeEditor(p('one'), p('two'), p('three'))
    const unitOf = (text: string) => getBlockUnitAt(editor.state.doc, posInText(editor, text))!
    return {editor, unitOf}
  }
  test('a shift-drag above the anchored block selects backward with the anchor block as the anchor end', () => {
    const {editor, unitOf} = setup()
    const anchor = unitOf('three')
    const run = getRunFromBoxes(editor.state.doc, unitOf('one'), unitOf('two'), anchor)!
    expect(isRunBackward(run, anchor)).toBe(true)
    const selection = createBlockSelection(editor.state.doc, run, isRunBackward(run, anchor))
    expect(selection.head).toBeLessThan(selection.anchor)
    expect(selection.anchor).toBe(anchor.to)
  })
  test('a shift-drag below the anchored block selects forward', () => {
    const {editor, unitOf} = setup()
    const anchor = unitOf('one')
    const run = getRunFromBoxes(editor.state.doc, unitOf('two'), unitOf('three'), anchor)!
    expect(isRunBackward(run, anchor)).toBe(false)
    const selection = createBlockSelection(editor.state.doc, run, isRunBackward(run, anchor))
    expect(selection.head).toBeGreaterThan(selection.anchor)
    expect(selection.anchor).toBe(anchor.from)
  })
  test('a run that only covers the anchor is forward', () => {
    const {unitOf} = setup()
    const anchor = unitOf('two')
    expect(isRunBackward({...anchor, depth: 0}, anchor)).toBe(false)
  })
})
