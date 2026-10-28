import {Editor} from '@tiptap/core'
import {serverTipTapExtensions} from '../serverTipTapExtensions'

const embedDoc = (attrs: Record<string, unknown>) => ({
  type: 'doc',
  content: [{type: 'embedBlock', attrs}]
})

const roundTrip = (attrs: Record<string, unknown>) => {
  const editor = new Editor({
    element: undefined,
    content: embedDoc(attrs),
    extensions: serverTipTapExtensions
  })
  const markdown = editor.getMarkdown()
  const reparsed = new Editor({
    element: undefined,
    content: markdown,
    contentType: 'markdown',
    extensions: serverTipTapExtensions
  })
  return {markdown, node: reparsed.getJSON().content?.find((node) => node.type === 'embedBlock')}
}

describe('embedBlock markdown round trip', () => {
  it('preserves url and formatting attrs through a serialize/parse round trip', () => {
    const url = 'https://www.loom.com/share/abc123def456'
    const {node} = roundTrip({
      url,
      displayMode: 'embed',
      align: 'center',
      aspectRatio: '16:9',
      providerName: 'Loom'
    })

    expect(node?.attrs?.url).toBe(url)
    expect(node?.attrs?.aspectRatio).toBe('16:9')
    expect(node?.attrs?.providerName).toBe('Loom')
  })

  it('does not serialize free-text provider fields that can break Pandoc attribute syntax', () => {
    const url = 'https://www.loom.com/share/abc123def456'
    const {markdown} = roundTrip({
      url,
      title: 'JSON {a} tips',
      description: 'She said "hi" to Bob',
      authorName: "Bob's channel"
    })

    expect(markdown).not.toMatch(/title=/)
    expect(markdown).not.toMatch(/description=/)
    expect(markdown).not.toMatch(/authorName=/)
  })

  it('survives a round trip as a real embedBlock even when free-text fields contain unsafe characters', () => {
    const url = 'https://www.loom.com/share/abc123def456'
    const {node} = roundTrip({
      url,
      title: 'JSON {a} tips',
      description: 'She said "hi" to Bob',
      authorName: "Bob's channel"
    })

    expect(node?.type).toBe('embedBlock')
    expect(node?.attrs?.url).toBe(url)
  })
})
