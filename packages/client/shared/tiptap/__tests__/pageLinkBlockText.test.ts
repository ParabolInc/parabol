import {generateText} from '@tiptap/core'
import {serverTipTapExtensions} from '../serverTipTapExtensions'

const docWithPageLink = (title: string) => ({
  type: 'doc',
  content: [
    {type: 'paragraph', content: [{type: 'text', text: 'Summaries'}]},
    {type: 'pageLinkBlock', attrs: {pageCode: 1917882336, title}}
  ]
})

describe('pageLinkBlock plain text', () => {
  it('renders the linked page title without link markup', () => {
    const text = generateText(docWithPageLink('Standup - Oct 19, 2026'), serverTipTapExtensions)
    expect(text).toBe('Summaries\n\nStandup - Oct 19, 2026')
  })

  it('falls back to the untitled label', () => {
    const text = generateText(docWithPageLink(''), serverTipTapExtensions)
    expect(text).toBe('Summaries\n\n<Untitled>')
  })
})
