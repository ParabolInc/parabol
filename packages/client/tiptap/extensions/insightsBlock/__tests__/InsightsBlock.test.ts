import {Editor} from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import ms from 'ms'
import {InsightsBlock} from '../InsightsBlock'

jest.mock('../InsightsBlockView', () => ({InsightsBlockView: () => null}))

afterEach(() => {
  jest.useRealTimers()
})

const createEditor = () =>
  new Editor({
    extensions: [StarterKit, InsightsBlock],
    content: {type: 'doc', content: [{type: 'paragraph'}]}
  })

const getInsightsBlocks = (editor: Editor) => {
  const blocks: Array<{id: string; after: string; before: string}> = []
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'insightsBlock') {
      blocks.push(node.attrs as {id: string; after: string; before: string})
    }
  })
  return blocks
}

const insertTwoInsightsBlocks = (editor: Editor) => {
  editor.commands.setInsights()
  editor.commands.setTextSelection(editor.state.doc.content.size - 1)
  editor.commands.setInsights()
  return getInsightsBlocks(editor)
}

describe('InsightsBlock setInsights', () => {
  it('assigns each inserted block a unique, non-empty id', () => {
    const editor = createEditor()
    const blocks = insertTwoInsightsBlocks(editor)

    expect(blocks).toHaveLength(2)
    const [first, second] = blocks
    expect(first!.id).toBeTruthy()
    expect(second!.id).toBeTruthy()
    expect(first!.id).not.toBe(second!.id)
  })

  it('stamps the block with the current time, not a frozen schema default', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
    const editor = createEditor()

    jest.setSystemTime(new Date('2026-01-01T06:00:00.000Z'))
    editor.commands.setInsights()

    const [block] = getInsightsBlocks(editor)
    expect(block!.before).toBe('2026-01-01T06:00:00.000Z')
    expect(block!.after).toBe(
      new Date(new Date('2026-01-01T06:00:00.000Z').getTime() - ms('12w')).toISOString()
    )
  })
})

describe('InsightsBlock content isolation across multiple blocks', () => {
  const findBlockPos = (editor: Editor, index: number) => {
    const matches: number[] = []
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'insightsBlock') {
        matches.push(pos)
      }
    })
    return matches[index]!
  }

  const writeToBlock = (editor: Editor, index: number, text: string) => {
    const pos = findBlockPos(editor, index)
    const node = editor.state.doc.nodeAt(pos)!
    editor.commands.insertContentAt(
      {from: pos + 1, to: pos + node.nodeSize - 1},
      {type: 'paragraph', content: [{type: 'text', text}]}
    )
  }

  it('writes streamed content into the correct block by position, not by id', () => {
    const editor = createEditor()
    insertTwoInsightsBlocks(editor)

    writeToBlock(editor, 0, 'first result')
    writeToBlock(editor, 1, 'second result')

    const firstNode = editor.state.doc.nodeAt(findBlockPos(editor, 0))!
    const secondNode = editor.state.doc.nodeAt(findBlockPos(editor, 1))!
    expect(firstNode.textContent).toBe('first result')
    expect(secondNode.textContent).toBe('second result')
    expect(editor.state.doc.lastChild?.type.name).toBe('paragraph')
  })
})
